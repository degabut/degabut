import { InjectDiscordClient, Once } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventBus } from "@nestjs/cqrs";
import { Client, GatewayDispatchEvents } from "discord.js";
import { Node } from "lavaclient";

import { PlayerTickEvent } from "./events";
import { QueuePlayerRepository } from "./repositories";

@Injectable()
export class QueuePlayerGateway {
  private readonly logger = new Logger(QueuePlayerGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly config: ConfigService,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly eventBus: EventBus,
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
      this.logger.error("Lavalink connected");
    });

    node.on("disconnect", (e) => {
      this.logger.error({ error: "Lavalink disconnected", e });
      process.exit(0);
    });

    node.on("error", (e) => {
      this.logger.error({ error: "Lavalink error", e });
      process.exit(0);
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
}
