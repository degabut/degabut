import { VoiceMemberLeftEvent } from "@discord-bot/events";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { MemberRemovedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceMemberLeftEvent)
export class VoiceMemberLeftListener implements IEventHandler<VoiceMemberLeftEvent> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async handle({ voiceChannel, member }: VoiceMemberLeftEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(voiceChannel.id);
    if (!queue) return;

    const removedMemberIndex = queue.voiceChannel.members.findIndex((m) => m.id === member.id);
    if (removedMemberIndex === -1) return;

    const removedMember = queue.voiceChannel.members[removedMemberIndex];
    queue.voiceChannel.members.splice(removedMemberIndex, 1);

    this.eventBus.publish(new MemberRemovedEvent({ member: removedMember, queue }));
  }
}
