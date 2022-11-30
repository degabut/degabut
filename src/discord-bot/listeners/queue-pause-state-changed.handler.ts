import { QueuePlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePauseStateChangedEvent } from "@queue/events";

@EventsHandler(QueuePauseStateChangedEvent)
export class QueuePauseStateChangedHandler implements IEventHandler<QueuePauseStateChangedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ queue }: QueuePauseStateChangedEvent) {
    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    if (queue.isPaused) player.audioPlayer.pause();
    else player.audioPlayer.resume();
  }
}
