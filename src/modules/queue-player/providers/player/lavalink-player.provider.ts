import { ILavalinkConfig } from "@common/config";
import { AsyncUtil } from "@common/utils";
import { Logger } from "@logger/logger.service";
import { Injectable } from "@nestjs/common";
import { Client, GatewayDispatchEvents } from "discord.js";
import { EventEmitter } from "events";
import { Node, NodeEvents, Player } from "lavaclient";
import TypedEventEmitter from "typed-emitter";

import {
  AudioPlayerEvents,
  AudioPlayerManagerEvents,
  IAudioPlayer,
  IAudioPlayerManager,
  TrackEndReason,
} from "./audio-player-manager.interface";

export type LavalinkFilter = Player["filters"];

@Injectable()
export class LavalinkPlayerProvider
  extends (EventEmitter as new () => TypedEventEmitter<AudioPlayerManagerEvents>)
  implements IAudioPlayerManager
{
  private readonly config: ILavalinkConfig;

  private isNodeConnected = false;
  private isNodeReconnecting = false;
  private client!: Client;
  private node!: Node;

  constructor(
    config: ILavalinkConfig,
    private readonly logger: Logger,
  ) {
    super();
    this.config = config;
    this.logger.setContext(LavalinkPlayerProvider.name);
  }

  init(client: Client): IAudioPlayerManager {
    this.client = client;
    this.node = new Node({
      discord: {
        sendGatewayCommand: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
      },
      info: {
        host: this.config.host,
        auth: this.config.password,
        port: 2333,
      },
    });

    client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data) =>
      this.node.players.handleVoiceUpdate(data),
    );
    client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data) =>
      this.node.players.handleVoiceUpdate(data),
    );

    this.node.on("connected", () => {
      this.isNodeConnected = true;
      this.logger.info("Lavalink connected");
    });

    this.node.on("disconnected", async (e) => {
      this.isNodeConnected = false;
      this.logger.error({ error: "Lavalink disconnected", ...e });
      this.reconnectNode();
    });

    this.node.on("error", async (e) => {
      this.logger.error({ error: "Lavalink error", ...e });
      if (!this.isNodeConnected) this.reconnectNode();
    });

    this.node.connect({ userId: this.client.user?.id });

    return this;
  }

  createAudioPlayer(guildId: string): IAudioPlayer {
    return new AudioPlayer(this.node.players.create(guildId), guildId);
  }

  get isReady(): boolean {
    return this.isNodeConnected;
  }

  private async reconnectNode(delay = 10000) {
    if (this.isNodeReconnecting) return;

    this.isNodeReconnecting = true;
    this.emit("disconnected");

    this.logger.info(`Reconnecting to lavalink in ${delay}ms`);

    await AsyncUtil.sleep(delay);

    this.node.disconnect();
    this.node.connect({ userId: this.client.user?.id });
    this.isNodeReconnecting = false;
  }
}

class AudioPlayer
  extends (EventEmitter as new () => TypedEventEmitter<AudioPlayerEvents>)
  implements IAudioPlayer
{
  private guildId: string;
  private readonly player: Player<Node>;
  private onTickListener: AudioPlayer["onTick"];

  constructor(player: Player<Node>, guildId: string) {
    super();
    this.player = player;
    this.guildId = guildId;

    this.player.voice.on("channelJoin", () => this.emit("ready"));
    this.player.voice.on("channelMove", (from, to) => this.emit("moved", from, to));
    this.player.on("disconnected", () => this.emit("disconnected"));
    this.player.on("trackStart", () => this.emit("trackStart"));
    this.player.on("trackEnd", (_, reason) =>
      this.emit(
        "trackEnd",
        reason === "finished"
          ? TrackEndReason.FINISHED
          : reason === "stopped"
            ? TrackEndReason.STOPPED
            : TrackEndReason.ERROR,
      ),
    );
    this.player.on("trackException", (e) =>
      this.emit("trackException", new Error(JSON.stringify(e) || "unknown")),
    );

    this.onTickListener = this.onTick.bind(this);
    this.player.node.ws.on("message", this.onTickListener);
  }

  private onTick(e: Parameters<NodeEvents["message"]>[0]) {
    if (e.op !== "playerUpdate") return;
    if (e.guildId !== this.guildId) return;
    this.emit("tick", this.position || null);
  }

  get isSeekable() {
    return true;
  }

  get isConnected() {
    return this.player.voice.connected;
  }

  get isPaused() {
    return this.player.paused;
  }

  get isPlaying() {
    return this.player.playing;
  }

  get position() {
    return this.player.position;
  }

  get filters() {
    return this.player.filters;
  }

  connect(voiceChannelId: string): void {
    this.player.voice.connect(voiceChannelId, { deafened: true });
  }

  disconnect(): void {
    this.player.voice.disconnect();
    this.player.node.removeListener("message", this.onTickListener);
    this.player.node.players.destroy(this.guildId, true);
  }

  async play(videoId: string) {
    const res = await this.player.node.api.loadTracks(videoId);

    if (res?.loadType !== "track") {
      if (res.loadType === "empty") throw new Error("Track Not Found");
      if (res.loadType === "error") throw res.data;
      else throw new Error("Unknown");
    }

    const track = res.data;
    if (!track) throw new Error("Track Not Found");

    await this.player.play(track);
  }

  async seek(position: number): Promise<void> {
    await this.player.seek(position);
  }

  async resume(): Promise<void> {
    await this.player.resume();
  }

  async pause(): Promise<void> {
    await this.player.pause();
  }

  async stop(): Promise<void> {
    await this.player.stop();
  }

  async applyFilters(filter: LavalinkFilter): Promise<void> {
    await this.player.setFilters(filter);
  }
}
