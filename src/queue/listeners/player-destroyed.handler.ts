import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerDestroyedEvent } from "@queue-player/events";
import { QueueDestroyedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(PlayerDestroyedEvent)
export class PlayerDestroyedHandler implements IEventHandler<PlayerDestroyedEvent> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async handle({ player }: PlayerDestroyedEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(player.voiceChannel.id);
    if (!queue) return;
    this.queueRepository.deleteByVoiceChannelId(player.voiceChannel.id);
    this.eventBus.publish(new QueueDestroyedEvent({ queue }));
  }
}
