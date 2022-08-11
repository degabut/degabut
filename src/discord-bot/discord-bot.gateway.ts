import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { Client, GuildMember, VoiceState } from "discord.js";

import { VoiceMemberJoinedEvent, VoiceMemberLeftEvent, VoiceMemberUpdatedEvent } from "./events";
import { QueuePlayerRepository } from "./repositories";

@Injectable()
export class DiscordBotGateway {
  private readonly logger = new Logger(DiscordBotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly eventBus: EventBus,
  ) {}

  @Once("ready")
  onReady() {
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
