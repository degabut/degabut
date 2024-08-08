import { Logger } from "@logger/logger.service";
import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { Member } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";
import { ActivityType } from "discord.js";
import { ContextOf, On, Once } from "necord";

@Injectable()
export class DiscordBotGateway {
  private botId!: string;

  constructor(
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
    private readonly queueRepository: QueueRepository,
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
      const queue = this.queueRepository.getByVoiceChannelId(newState.channel.id);
      if (!queue) return;

      queue.addMember(Member.fromDiscordGuildMember(newState.member, true));
    } else if (botInOldChannel && oldState.channel && oldState.member) {
      const queue = this.queueRepository.getByVoiceChannelId(oldState.channel.id);
      if (!queue) return;

      queue.removeMember(oldState.member.id);
    }
  }

  @On("guildMemberUpdate")
  onGuildMemberUpdate([, member]: ContextOf<"guildMemberUpdate">) {
    if (member.user.bot) return;

    const voiceChannel = member.voice.channel;
    if (!voiceChannel?.members.has(this.botId)) return;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannel.id);
    if (!queue) return;

    const memberToUpdate = Member.fromDiscordGuildMember(member, true);
    queue.updateMember(memberToUpdate);
  }
}
