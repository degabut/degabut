import { VoiceMemberUpdatedEvent } from "@discord-bot/events";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Member } from "@queue/entities";
import { MemberUpdatedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceMemberUpdatedEvent)
export class VoiceMemberUpdatedListener implements IEventHandler<VoiceMemberUpdatedEvent> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async handle({ voiceChannel, member }: VoiceMemberUpdatedEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(voiceChannel.id);
    if (!queue || member.user.bot) return;

    const updatedMember = new Member({
      id: member.id,
      username: member.user.username,
      nickname: member.nickname,
      displayName: member.displayName,
      discriminator: member.user.discriminator,
      avatar: member.user.avatarURL(),
    });

    const index = queue.voiceChannel.members.findIndex((m) => m.id === member.id);
    if (index === -1) return;
    queue.voiceChannel.members[index] = updatedMember;

    this.eventBus.publish(new MemberUpdatedEvent({ member: updatedMember, queue }));
  }
}
