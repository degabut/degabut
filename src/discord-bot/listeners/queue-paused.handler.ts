import { PlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePausedEvent } from "@queue/events";

@EventsHandler(QueuePausedEvent)
export class QueuePausedHandler implements IEventHandler<QueuePausedEvent> {
  constructor(private readonly playerRepository: PlayerRepository) {}

  public async handle({ queue }: QueuePausedEvent) {
    const player = this.playerRepository.getByGuildId(queue.guildId);
    if (!player) return;

    if (queue.isPaused) player.audioPlayer.pause();
    else player.audioPlayer.unpause();
  }
}