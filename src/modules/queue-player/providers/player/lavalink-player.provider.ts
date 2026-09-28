import { ILavalinkConfig, INodeLinkConfig } from "@common/config";
import { Logger } from "@logger/logger.service";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Client } from "discord.js";
import { EventEmitter } from "events";
import {
  LavalinkFilterData,
  LavalinkManager,
  NodeLinkNode,
  NodeType,
  Player,
} from "lavalink-client";
import { ReadableStream } from "stream/web";
import TypedEventEmitter from "typed-emitter";

import {
  AudioPlayerEvents,
  AudioPlayerManagerEvents,
  IAudioPlayer,
  IAudioPlayerManager,
  TrackEndReason,
} from "./audio-player-manager.interface";

export type LavalinkFilter = LavalinkFilterData;

@Injectable()
export class LavalinkPlayerProvider
  extends (EventEmitter as new () => TypedEventEmitter<AudioPlayerManagerEvents>)
  implements IAudioPlayerManager
{
  private static NODE_ID = "default";

  private readonly config: ILavalinkConfig | INodeLinkConfig;

  private isNodeConnected = false;
  private client!: Client;
  private manager!: LavalinkManager;

  constructor(
    config: ILavalinkConfig | INodeLinkConfig,
    private type: NodeType,
    private readonly logger: Logger,
  ) {
    super();
    this.config = config;
    this.logger.setContext(LavalinkPlayerProvider.name);
  }

  init(client: Client): IAudioPlayerManager {
    this.client = client;
    this.manager = new LavalinkManager({
      nodes: [
        {
          id: LavalinkPlayerProvider.NODE_ID,
          authorization: this.config.password,
          host: this.config.host,
          port: this.config.port || 2333,
          retryDelay: 5000,
          retryAmount: Number.POSITIVE_INFINITY,
          nodeType: this.type,
        },
      ],
      sendToShard: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
      autoSkip: true,
      autoSkipOnResolveError: true,
      client: this.client.user ? { id: this.client.user?.id || "" } : undefined,
    });

    client.on("raw", (d) => this.manager.sendRawData(d));

    this.manager.nodeManager.on("connect", () => {
      this.isNodeConnected = true;
      this.logger.info("Lavalink connected");
    });

    this.manager.nodeManager.on("disconnect", async (_, reason) => {
      this.isNodeConnected = false;
      this.logger.error({ error: `Lavalink disconnected`, reason });
    });

    this.manager.nodeManager.on("error", async (_, e) => {
      this.logger.error({ error: "Lavalink error", ...e });
    });

    this.manager.nodeManager.on("reconnecting", async () => {
      this.isNodeConnected = false;
      this.logger.info(`Reconnecting to lavalink in 5s`);
    });

    this.manager.init({ id: this.client.user?.id || "" });

    return this;
  }

  createAudioPlayer(guildId: string): IAudioPlayer {
    return new AudioPlayer(this.manager, guildId);
  }

  get isReady(): boolean {
    return this.isNodeConnected;
  }
}

class AudioPlayer
  extends (EventEmitter as new () => TypedEventEmitter<AudioPlayerEvents>)
  implements IAudioPlayer
{
  private guildId: string;
  private readonly manager: LavalinkManager;
  private player?: Player;

  constructor(manager: LavalinkManager, guildId: string) {
    super();
    this.manager = manager;
    this.guildId = guildId;
  }

  get isSeekable() {
    return true;
  }

  get isConnected() {
    return this.player?.connected || false;
  }

  get isPaused() {
    return this.player?.paused || false;
  }

  get isPlaying() {
    return this.player?.playing || false;
  }

  get position() {
    return this.player?.position || 0;
  }

  get filters() {
    return this.player?.filterManager.filters || {};
  }

  connect(voiceChannelId: string): void {
    this.player = this.manager.createPlayer({
      guildId: this.guildId,
      voiceChannelId,
      selfDeaf: true,
      instaUpdateFiltersFix: true,
    });

    this.manager.on("playerMove", (player, from, to) => {
      if (player.guildId !== this.guildId) return;
      this.emit("moved", from, to);
    });
    this.manager.on("playerDisconnect", (player) => {
      if (player.guildId !== this.guildId) return;
      this.emit("disconnected");
    });
    this.manager.on("trackStart", (player) => {
      if (player.guildId !== this.guildId) return;
      this.emit("trackStart");
    });
    this.manager.on("queueEnd", (player, _, event) => {
      if (player.guildId !== this.guildId) return;
      this.emit(
        "trackEnd",
        event.type === "TrackEndEvent" ? TrackEndReason.FINISHED : TrackEndReason.STOPPED,
      );
    });
    this.manager.on("trackError", (player, _, e) => {
      if (player.guildId !== this.guildId) return;
      this.emit("trackException", new Error(JSON.stringify(e) || "unknown"));
    });
    this.manager.on("playerUpdate", (_, player) => {
      if (player.guildId !== this.guildId || !player.connected) return;
      this.emit("tick", player.position || null);
    });

    this.player.connect().then((player) => {
      if (player.guildId !== this.guildId) return;
      this.emit("ready");
    });
  }

  disconnect(): void {
    if (!this.player) return;
    this.player.destroy();
    this.player.disconnect();
  }

  async play(videoId: string) {
    if (!this.player) throw new Error("Player not connected");

    const url = `https://www.youtube.com/watch?v=${videoId}`;

    const { response } = await this.player.node.rawRequest(
      `/loadtracks?identifier=${encodeURIComponent(url)}`,
      (opt) => (opt.method = "GET"),
    );

    const loadTrackResult = await response.json();

    const { loadType, data } = loadTrackResult;

    if (loadType !== "track") {
      if (loadType === "empty") throw new Error("Track Not Found");
      if (loadType === "error") throw data;
      else throw new Error("Unknown");
    }

    await this.player.play({ track: data });
  }
    const track = res.data;
    if (!track) throw new Error("Track Not Found");

    await this.player.play(track);
  }

  async seek(position: number): Promise<void> {
    await this.player?.seek(position);
  }

  async resume(): Promise<void> {
    await this.player?.resume();
  }

  async pause(): Promise<void> {
    await this.player?.pause();
  }

  async stop(): Promise<void> {
    await this.player?.stopPlaying();
  }

  async applyFilters(filter: LavalinkFilter): Promise<void> {
    if (!this.player) return;

    this.player.filterManager.data = filter;
    await this.player.filterManager.applyPlayerFilters();
  }
}
