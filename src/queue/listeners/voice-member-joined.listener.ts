import { VoiceMemberJoinedEvent } from "@discord-bot/events";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Member } from "@queue/entities";
import { MemberJoinedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceMemberJoinedEvent)
export class VoiceMemberJoinedListener implements IEventHandler<VoiceMemberJoinedEvent> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async handle({ voiceChannel, member }: VoiceMemberJoinedEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(voiceChannel.id);
    if (!queue || member.user.bot) return;

    const newMember = Member.fromDiscordGuildMember(member, true);

    queue.voiceChannel.members.push(newMember);

    this.eventBus.publish(new MemberJoinedEvent({ member: newMember, queue }));
  }
}
