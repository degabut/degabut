import { VoiceMemberLeftEvent } from "@discord-bot/events";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { MemberLeftEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceMemberLeftEvent)
export class VoiceMemberLeftListener implements IEventHandler<VoiceMemberLeftEvent> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async handle({ voiceChannel, member }: VoiceMemberLeftEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(voiceChannel.id);
    if (!queue || member.user.bot) return;

    const leftMember = queue.voiceChannel.members.find((m) => m.id === member.id);
    if (!leftMember) return;

    leftMember.isInVoiceChannel = false;

    this.eventBus.publish(new MemberLeftEvent({ member: leftMember, queue }));
  }
}
