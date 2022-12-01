import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventBus } from "@nestjs/cqrs";
import { Client, GatewayDispatchEvents, GuildMember, VoiceState } from "discord.js";
import { Node } from "lavaclient";

import {
  PlayerTickEvent,
  VoiceMemberJoinedEvent,
  VoiceMemberLeftEvent,
  VoiceMemberUpdatedEvent,
} from "./events";
import { QueuePlayerRepository } from "./repositories";

@Injectable()
export class DiscordBotGateway {
  private readonly logger = new Logger(DiscordBotGateway.name);

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
        host: this.config.getOrThrow("discord-bot.lavalinkHost"),
        password: this.config.getOrThrow("discord-bot.lavalinkPassword"),
        port: this.config.get("discord-bot.lavalinkPort") || 2333,
      },
    });

    client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data) => node.handleVoiceUpdate(data));
    client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data) => node.handleVoiceUpdate(data));
    client.lavalink = node;
  }

  @Once("ready")
  onReady() {
    this.client.lavalink.connect(this.client.user?.id);

    this.client.lavalink.on("error", (e) => {
      this.logger.error("Lavalink Error", e);
      process.exit(0);
    });

    this.client.lavalink.on("disconnect", (e) => {
      this.logger.error("Lavalink Disconnected", e);
      process.exit(0);
    });

    this.client.lavalink.on("raw", (e) => {
      if (e.op !== "playerUpdate") return;

      const player = this.playerRepository.getByGuildId(e.guildId);
      if (!player) return;

      const event = new PlayerTickEvent({ player, position: e.state.position || null });
      this.eventBus.publish(event);
    });
    this.logger.log("Discord bot ready");
  }

  @On("voiceStateUpdate")
  onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    if (
      oldState.channelId === newState.channelId ||
      !newState.member ||
      newState.member.id === this.client.user?.id
    ) {
      return;
    }

    const leftPlayer = oldState.channelId
      ? this.playerRepository.getByVoiceChannelId(oldState.channelId)
      : null;

    if (leftPlayer) {
      const event = new VoiceMemberLeftEvent({ player: leftPlayer, member: newState.member });
      return this.eventBus.publish(event);
    }

    const joinedPlayer = newState.channelId
      ? this.playerRepository.getByVoiceChannelId(newState.channelId)
      : null;

    if (joinedPlayer) {
      const event = new VoiceMemberJoinedEvent({ player: joinedPlayer, member: newState.member });
      return this.eventBus.publish(event);
    }
  }

  @On("guildMemberUpdate")
  onGuildMemberUpdate(_: GuildMember, newMember: GuildMember) {
    const voiceChannelId = newMember.voice.channelId;
    if (!voiceChannelId) return;
    const player = this.playerRepository.getByVoiceChannelId(voiceChannelId);
    if (!player) return;

    const event = new VoiceMemberUpdatedEvent({ player, member: newMember });
    this.eventBus.publish(event);
  }
}
