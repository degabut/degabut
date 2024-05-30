import { ILavalinkConfig } from "@common/config";
import { AsyncUtil } from "@common/utils";
import { Logger } from "@logger/logger.service";
import { Injectable } from "@nestjs/common";
import { Client, GatewayDispatchEvents } from "discord.js";
import { EventEmitter } from "events";
import { Node, NodeEvents, NodeState, Player } from "lavaclient";
import TypedEventEmitter from "typed-emitter";

import {
  AudioPlayerEvents,
  AudioPlayerManagerEvents,
  IAudioPlayer,
  IAudioPlayerManager,
} from "./audio-player-manager.interface";

@Injectable()
export class LavalinkPlayerProvider
  extends (EventEmitter as new () => TypedEventEmitter<AudioPlayerManagerEvents>)
  implements IAudioPlayerManager
{
  private readonly config: ILavalinkConfig;

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
      sendGatewayPayload: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        port: 2333,
        ...this.config,
      },
    });

    client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data) =>
      this.node.handleVoiceUpdate(data),
    );
    client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data) =>
      this.node.handleVoiceUpdate(data),
    );

    this.node.on("connect", () => {
      this.logger.info("Lavalink connected");
    });

    this.node.on("disconnect", async (e) => {
      this.logger.error({ error: "Lavalink disconnected", ...e });
      this.reconnectNode();
    });

    this.node.on("error", async (e) => {
      this.logger.error({ error: "Lavalink error", ...e });
      if (this.node.state !== NodeState.Connected) this.reconnectNode();
    });

    this.node.connect(this.client.user?.id);

    return this;
  }

  createAudioPlayer(guildId: string): IAudioPlayer {
    return new AudioPlayer(this.node.createPlayer(guildId));
  }

  get isReady(): boolean {
    return this.node.state === NodeState.Connected;
  }

  private async reconnectNode(delay = 10000) {
    const node = this.node;
    if (this.isNodeReconnecting) return;

    this.isNodeReconnecting = true;
    this.emit("disconnected");

    this.logger.info(`Reconnecting to lavalink in ${delay}ms`);

    await AsyncUtil.sleep(delay);
    node.conn.reconnect();
    this.isNodeReconnecting = false;
  }
}

class AudioPlayer
  extends (EventEmitter as new () => TypedEventEmitter<AudioPlayerEvents>)
  implements IAudioPlayer
{
  private readonly player: Player<Node>;

  constructor(player: Player<Node>) {
    super();
    this.player = player;

    this.player.on("channelJoin", () => this.emit("ready"));
    this.player.on("channelMove", (from, to) => this.emit("moved", from, to));
    this.player.on("disconnected", () => this.emit("disconnected"));
    this.player.on("trackStart", () => this.emit("trackStart"));
    this.player.on("trackEnd", (_, reason) => this.emit("trackEnd", reason === "FINISHED"));
    this.player.on("trackException", (e) => this.emit("trackException", new Error(e || "unknown")));
    this.player.node.on("raw", this.onTick.bind(this));
  }

  private onTick(e: Parameters<NodeEvents["raw"]>[0]) {
    if (e.op !== "playerUpdate") return;
    if (e.guildId !== this.player.guildId) return;
    this.emit("tick", this.position || null);
  }

  get isSeekable() {
    return true;
  }

  get isConnected() {
    return this.player.connected;
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

  connect(voiceChannelId: string): void {
    this.player.connect(voiceChannelId, { deafened: true });
  }

  disconnect(): void {
    this.player.disconnect();
    this.player.node.removeListener("raw", this.onTick);
    this.player.node.destroyPlayer(this.player.guildId);
  }

  async play(videoId: string) {
    const res = await this.player.node.rest.loadTracks(videoId);

    if (res?.loadType !== "TRACK_LOADED") {
      if (res.loadType === "NO_MATCHES") throw new Error("Track Not Found");
      if (res.exception) throw res.exception;
      else throw new Error("Unknown");
    }

    const track = res.tracks.at(0);
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
}
