import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerDestroyedEvent } from "@queue-player/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(PlayerDestroyedEvent)
export class PlayerDestroyedListener implements IEventHandler<PlayerDestroyedEvent> {
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ player }: PlayerDestroyedEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(player.voiceChannel.id);
    if (!queue) return;

    this.queueRepository.deleteByVoiceChannelId(player.voiceChannel.id);

    queue.destroy();
  }
}
