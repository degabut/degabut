import { QueuePlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePausedEvent } from "@queue/events";

@EventsHandler(QueuePausedEvent)
export class QueuePausedHandler implements IEventHandler<QueuePausedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ queue }: QueuePausedEvent) {
    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    if (queue.isPaused) player.audioPlayer.pause();
    else player.audioPlayer.unpause();
  }
}
