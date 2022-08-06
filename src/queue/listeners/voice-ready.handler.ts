import { VoiceReadyEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Queue } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceReadyEvent)
export class VoiceReadyHandler implements IEventHandler<VoiceReadyEvent> {
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ player }: VoiceReadyEvent): Promise<void> {
    let queue = this.queueRepository.getByGuildId(player.guild.id);
    if (queue) return;

    queue = new Queue({
      guildId: player.guild.id,
    });
    this.queueRepository.save(queue);
  }
}
