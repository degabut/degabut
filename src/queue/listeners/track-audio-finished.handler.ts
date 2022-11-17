import { TrackAudioFinishedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueService } from "@queue/services";

@EventsHandler(TrackAudioFinishedEvent)
export class TrackAudioFinishedHandler implements IEventHandler<TrackAudioFinishedEvent> {
  constructor(private readonly queueService: QueueService) {}

  public async handle({ track }: TrackAudioFinishedEvent): Promise<void> {
    const queue = track.queue;
    if (queue.shuffle) queue.shuffleHistoryIds.push(track.id);
  }
}
