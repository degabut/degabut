import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Track } from "@queue/entities";
import { TrackAddedEvent, TracksAddedEvent } from "@queue/events";
import { QueueService } from "@queue/services";

const events = [TrackAddedEvent, TracksAddedEvent];
type Events = InstanceType<(typeof events)[number]>;

@EventsHandler(...events)
export class TrackAddedListener implements IEventHandler<Events> {
  constructor(private readonly queueService: QueueService) {}

  public async handle(e: Events): Promise<void> {
    let track: Track;

    if ("track" in e) track = e.track;
    else track = e.tracks[0];

    const queue = track.queue;
    if (queue.nowPlaying) return;

    queue.nextTrack = track;
    this.queueService.processQueue(queue);
  }
}
