import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { Client, GuildMember, VoiceState } from "discord.js";

import { VoiceMemberJoinedEvent, VoiceMemberLeftEvent, VoiceMemberUpdatedEvent } from "./events";

@Injectable()
export class DiscordBotGateway {
  private readonly logger = new Logger(DiscordBotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly eventBus: EventBus,
  ) {}

  @Once("ready")
  onReady() {
    this.logger.log("Discord bot ready");
  }

  @On("voiceStateUpdate")
  onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    const userId = this.client.user?.id;
    if (
      oldState.channelId === newState.channelId ||
      !newState.member ||
      newState.member.id === userId
    ) {
      return;
    }

    const botInNewChannel = !!newState.channel?.members.find((m) => m.id === userId);
    const botInOldChannel = !!oldState.channel?.members.find((m) => m.id === userId);
    if (!botInNewChannel && !botInOldChannel) return;

    if (newState.channel && botInNewChannel) {
      const event = new VoiceMemberJoinedEvent({
        voiceChannel: newState.channel,
        member: newState.member,
      });
      this.eventBus.publish(event);
    } else if (oldState.channel && botInOldChannel) {
      const event = new VoiceMemberLeftEvent({
        voiceChannel: oldState.channel,
        member: newState.member,
      });
      this.eventBus.publish(event);
    }
  }

  @On("guildMemberUpdate")
  onGuildMemberUpdate(_: GuildMember, member: GuildMember) {
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) return;
    if (!voiceChannel.members.find((m) => m.id === this.client.user?.id)) return;

    const event = new VoiceMemberUpdatedEvent({ voiceChannel, member });
    this.eventBus.publish(event);
  }
}
