import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAudioEndedEvent, TrackLoadFailedEvent } from "@queue-player/events";
import { TrackRemovedEvent } from "@queue/events";
import { QueueService } from "@queue/services";

@EventsHandler(TrackLoadFailedEvent)
export class TrackLoadFailedListener implements IEventHandler<TrackAudioEndedEvent> {
  constructor(private readonly eventBus: EventBus, private readonly queueService: QueueService) {}

  public async handle({ track }: TrackAudioEndedEvent): Promise<void> {
    const queue = track.queue;
    queue.tracks = queue.tracks.filter((t) => t.id !== track.id);
    this.eventBus.publish(new TrackRemovedEvent({ isNowPlaying: true, track }));
    this.queueService.processQueue(track.queue);
  }
}
