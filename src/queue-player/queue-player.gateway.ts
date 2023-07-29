import { AsyncUtil } from "@common/utils";
import { InjectDiscordClient, Once } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventBus } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";
import { Client, GatewayDispatchEvents } from "discord.js";
import { Node, NodeState } from "lavaclient";

import { PlayerTickEvent } from "./events";
import { QueuePlayerRepository } from "./repositories";

@Injectable()
export class QueuePlayerGateway {
  private readonly logger = new Logger(QueuePlayerGateway.name);
  private isNodeReconnecting = false;

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly config: ConfigService,
    private readonly eventBus: EventBus,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly queueRepository: QueueRepository,
  ) {
    const node = new Node({
      sendGatewayPayload: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        host: this.config.getOrThrow("queue-player.lavalinkHost"),
        password: this.config.getOrThrow("queue-player.lavalinkPassword"),
        port: this.config.get("queue-player.lavalinkPort") || 2333,
      },
    });

    client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data) => node.handleVoiceUpdate(data));
    client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data) => node.handleVoiceUpdate(data));
    client.lavalink = node;

    node.on("connect", () => {
      this.logger.log("Lavalink connected");
    });

    node.on("disconnect", async (e) => {
      this.logger.error({ error: "Lavalink disconnected", e });
      this.reconnectNode();
    });

    node.on("error", async (e) => {
      this.logger.error({ error: "Lavalink error", e });
      if (node.state !== NodeState.Connected) this.reconnectNode();
    });

    node.on("raw", (e) => {
      if (e.op !== "playerUpdate") return;

      const player = this.playerRepository.getByGuildId(e.guildId);
      if (!player) return;

      const event = new PlayerTickEvent({ player, position: e.state.position || null });
      this.eventBus.publish(event);
    });
  }

  @Once("ready")
  onReady() {
    this.client.lavalink.connect(this.client.user?.id);
  }

  private async reconnectNode(delay = 10000) {
    const node = this.client.lavalink;
    if (this.isNodeReconnecting) return;

    this.isNodeReconnecting = true;

    this.queueRepository.clear();
    this.playerRepository.clear();

    this.logger.log(`Reconnecting to lavalink in ${delay}ms`);
    await AsyncUtil.sleep(delay);
    node.conn.reconnect();

    this.isNodeReconnecting = false;
  }
}
