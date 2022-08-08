import { VoiceMemberJoinedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Member } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceMemberJoinedEvent)
export class VoiceMemberJoinedHandler implements IEventHandler<VoiceMemberJoinedEvent> {
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ player, member }: VoiceMemberJoinedEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(player.voiceChannel.id);
    if (!queue) return;

    const newMember = new Member({
      id: member.id,
      username: member.user.username,
      nickname: member.nickname,
      displayName: member.displayName,
      discriminator: member.user.discriminator,
      avatar: member.user.avatarURL(),
    });

    queue.voiceChannel.members.push(newMember);
  }
}
