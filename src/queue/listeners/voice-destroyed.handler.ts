import { VoiceDestroyedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceDestroyedEvent)
export class VoiceDestroyedHandler implements IEventHandler<VoiceDestroyedEvent> {
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ player }: VoiceDestroyedEvent): Promise<void> {
    this.queueRepository.deleteByGuildId(player.guild.id);
  }
}
