import { VoiceDestroyedEvent } from "@discord-bot/events";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueDestroyedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceDestroyedEvent)
export class VoiceDestroyedHandler implements IEventHandler<VoiceDestroyedEvent> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async handle({ player }: VoiceDestroyedEvent): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(player.voiceChannel.id);
    if (!queue) return;
    this.queueRepository.deleteByVoiceChannelId(player.voiceChannel.id);
    this.eventBus.publish(new QueueDestroyedEvent({ queue }));
  }
}
