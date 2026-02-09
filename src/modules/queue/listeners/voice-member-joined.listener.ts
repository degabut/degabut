import { VoiceMemberJoinedEvent } from "@main/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Member } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceMemberJoinedEvent)
export class VoiceMemberJoinedListener implements IEventHandler<VoiceMemberJoinedEvent> {
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ voiceChannel, member }: VoiceMemberJoinedEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(voiceChannel.id);
    if (!queue || member.user.bot) return;

    const newMember = Member.fromDiscordGuildMember(member, true, false);

    queue.addMember(newMember);
  }
}
