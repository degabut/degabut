import { VoiceMemberLeftEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceMemberLeftEvent)
export class VoiceMemberLeftListener implements IEventHandler<VoiceMemberLeftEvent> {
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ voiceChannel, member }: VoiceMemberLeftEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(voiceChannel.id);
    if (!queue || member.user.bot) return;

    queue.removeMember(member.id);
  }
}
