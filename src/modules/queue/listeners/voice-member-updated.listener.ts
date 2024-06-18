import { VoiceMemberUpdatedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Member } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceMemberUpdatedEvent)
export class VoiceMemberUpdatedListener implements IEventHandler<VoiceMemberUpdatedEvent> {
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ voiceChannel, member }: VoiceMemberUpdatedEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(voiceChannel.id);
    if (!queue || member.user.bot) return;

    const memberToUpdate = Member.fromDiscordGuildMember(member, true);
    queue.updateMember(memberToUpdate);
  }
}
