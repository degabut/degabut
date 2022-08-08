import { VoiceMemberLeftEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceMemberLeftEvent)
export class VoiceMemberLeftHandler implements IEventHandler<VoiceMemberLeftEvent> {
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ player, member }: VoiceMemberLeftEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(player.voiceChannel.id);
    if (!queue) return;

    queue.voiceChannel.members = queue.voiceChannel.members.filter((m) => m.id !== member.id);
  }
}
