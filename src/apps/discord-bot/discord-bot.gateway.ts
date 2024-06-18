import { Logger } from "@logger/logger.service";
import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { ActivityType } from "discord.js";
import { ContextOf, On, Once } from "necord";

import { VoiceMemberJoinedEvent, VoiceMemberLeftEvent, VoiceMemberUpdatedEvent } from "./events";

@Injectable()
export class DiscordBotGateway {
  private botId!: string;

  constructor(
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(DiscordBotGateway.name);
  }

  @Once("ready")
  onceReady([client]: ContextOf<"ready">) {
    this.logger.info("Discord bot ready");
    this.botId = client.user.id;
  }

  @On("ready")
  onReady([client]: ContextOf<"ready">) {
    client.user.setActivity({ name: `${client.prefix}help`, type: ActivityType.Listening });
  }

  @On("voiceStateUpdate")
  onVoiceStateUpdate([oldState, newState]: ContextOf<"voiceStateUpdate">) {
    // only handle channel change state
    if (oldState.channelId === newState.channelId || !newState.member || newState.member.user.bot) {
      return;
    }

    const botInNewChannel = !!newState.channel?.members.has(this.botId);
    const botInOldChannel = !!oldState.channel?.members.has(this.botId);

    // ignore state update outside of bot channel
    if (!botInNewChannel && !botInOldChannel) return;

    if (botInNewChannel && newState.channel && newState.member) {
      const event = new VoiceMemberJoinedEvent({
        voiceChannel: newState.channel,
        member: newState.member,
      });
      this.eventBus.publish(event);
    } else if (botInOldChannel && oldState.channel && oldState.member) {
      const event = new VoiceMemberLeftEvent({
        voiceChannel: oldState.channel,
        member: oldState.member,
      });
      this.eventBus.publish(event);
    }
  }

  @On("guildMemberUpdate")
  onGuildMemberUpdate([_, member]: ContextOf<"guildMemberUpdate">) {
    if (member.user.bot) return;

    const voiceChannel = member.voice.channel;
    if (!voiceChannel?.members.has(this.botId)) return;

    const event = new VoiceMemberUpdatedEvent({ voiceChannel, member });
    this.eventBus.publish(event);
  }
}
