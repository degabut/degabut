import { ILavalinkConfig, INodeLinkConfig } from "@common/config";
import { Logger } from "@logger/logger.service";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Client } from "discord.js";
import { EventEmitter } from "events";
import {
  LavalinkFilterData,
  LavalinkManager,
  NodeLinkNode,
  NodeType,
  Player,
} from "lavalink-client";
import { Readable } from "stream";
import TypedEventEmitter from "typed-emitter";

import {
  AudioPlayerEvents,
  AudioPlayerManagerEvents,
  IAudioPlayer,
  IAudioPlayerManager,
  PlayerStream,
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
    return new AudioPlayer(this.manager, guildId, this.config);
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
  private readonly config: ILavalinkConfig | INodeLinkConfig;
  private player?: Player;

  constructor(
    manager: LavalinkManager,
    guildId: string,
    config: ILavalinkConfig | INodeLinkConfig,
  ) {
    super();
    this.manager = manager;
    this.guildId = guildId;
    this.config = config;
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

  get type() {
    return this.player?.node.nodeType.toLowerCase() as string;
  }

  get filters() {
    if (!this.player) return {};

    // filter out disabled filters
    const enabledFilters: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.player.filterManager.data)) {
      if ((this.player.filterManager.filters as unknown as Record<string, boolean>)[key]) {
        enabledFilters[key] = value;
      }
    }
    // custom handling for timescale
    const hasTimescale = Object.values(this.player.filterManager.data.timescale || {}).some(
      (d) => d !== 1,
    );
    if (hasTimescale) enabledFilters["timescale"] = this.player.filterManager.data.timescale;

    // custom handling for eq
    const hasEq = Object.values(this.player.filterManager.equalizerBands || {}).some(
      (d) => d.gain !== 0,
    );
    if (hasEq) enabledFilters["equalizer"] = this.player.filterManager.equalizerBands;

    return enabledFilters;
  }

  get plugins() {
    return this.player?.node.info?.plugins.map((p) => p.name) || [];
  }

  private readonly onPlayerMove = (player: Player, from: string, to: string): void => {
    if (player.guildId !== this.guildId) return;
    this.emit("moved", from, to);
  };

  private readonly onPlayerDisconnect = (player: Player): void => {
    if (player.guildId !== this.guildId) return;
    this.emit("disconnected");
  };

  private readonly onPlayerDestroy = (player: Player): void => {
    if (player.guildId !== this.guildId) return;
    this.emit("destroyed");
  };

  private readonly onTrackStart = (player: Player): void => {
    if (player.guildId !== this.guildId) return;
    this.emit("trackStart");
  };

  private readonly onQueueEnd = (
    player: Player,
    _track: unknown,
    event: { type: string },
  ): void => {
    if (player.guildId !== this.guildId) return;
    this.emit(
      "trackEnd",
      event.type === "TrackEndEvent" ? TrackEndReason.FINISHED : TrackEndReason.STOPPED,
    );
  };

  private readonly onTrackError = (player: Player, _track: unknown, e: unknown): void => {
    if (player.guildId !== this.guildId) return;
    this.emit("trackException", new Error(JSON.stringify(e) || "unknown"));
  };

  private readonly onPlayerUpdate = (_oldPlayerJson: unknown, player: Player): void => {
    if (player.guildId !== this.guildId || !player.connected) return;
    this.emit("tick", player.position || null);
  };

  private attachManagerListeners(): void {
    this.detachManagerListeners();

    this.manager.on("playerMove", this.onPlayerMove);
    this.manager.on("playerDisconnect", this.onPlayerDisconnect);
    this.manager.on("playerDestroy", this.onPlayerDestroy);
    this.manager.on("trackStart", this.onTrackStart);
    this.manager.on("queueEnd", this.onQueueEnd);
    this.manager.on("trackError", this.onTrackError);
    this.manager.on("playerUpdate", this.onPlayerUpdate);
  }

  private detachManagerListeners(): void {
    this.manager.off("playerMove", this.onPlayerMove);
    this.manager.off("playerDisconnect", this.onPlayerDisconnect);
    this.manager.off("playerDestroy", this.onPlayerDestroy);
    this.manager.off("trackStart", this.onTrackStart);
    this.manager.off("queueEnd", this.onQueueEnd);
    this.manager.off("trackError", this.onTrackError);
    this.manager.off("playerUpdate", this.onPlayerUpdate);
  }

  connect(voiceChannelId: string): void {
    this.player = this.manager.createPlayer({
      guildId: this.guildId,
      voiceChannelId,
      selfDeaf: true,
    });

    this.attachManagerListeners();

    this.player.connect().then((player) => {
      if (player.guildId !== this.guildId) return;
      this.emit("ready");
    });
  }

  disconnect(): void {
    this.detachManagerListeners();
    if (!this.player) return;
    this.player.destroy();
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

  async openLiveStream(onClose?: () => void): Promise<PlayerStream> {
    if (!this.player) throw new BadRequestException("Player not connected");

    if (!(this.player.node instanceof NodeLinkNode) || !this.plugins?.includes("live-stream")) {
      throw new BadRequestException("Live streaming is available");
    }

    const port = this.config.port || 2333;
    const url = `http://${this.config.host}:${port}/${this.player.node.sessionId}:${this.guildId}/stream?format=opus`;

    const response = await fetch(url, {
      headers: { authorization: this.config.password },
    });

    if (!response.ok || !response.body) {
      await response.body?.cancel().catch(() => undefined);
      throw new InternalServerErrorException(
        `Audio node refused the live stream (status ${response.status})`,
      );
    }

    const body = response.body as unknown as import("stream/web").ReadableStream<Uint8Array>;

    const reported = response.headers.get("content-type") || "audio/ogg";
    const contentType = reported.includes("codecs=") ? reported : `${reported}; codecs=opus`;

    let isClosed = false;
    return {
      stream: Readable.fromWeb(body) as unknown as AsyncIterable<Uint8Array>,
      contentType,
      close: async () => {
        if (isClosed) return;
        isClosed = true;
        await body.cancel().catch(() => undefined);
        onClose?.();
      },
    };
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
    if (filter.equalizer) await this.player.filterManager.setEQ(filter.equalizer);
    else await this.player.filterManager.clearEQ();
    await this.player.filterManager.applyPlayerFilters();
  }
}
