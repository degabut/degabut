import { TrackAudioStartedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { MAX_QUEUE_HISTORY_TRACKS } from "@queue/queue.constants";

@EventsHandler(TrackAudioStartedEvent)
export class TrackAudioStartedHandler implements IEventHandler<TrackAudioStartedEvent> {
  public async handle({ track }: TrackAudioStartedEvent): Promise<void> {
    const queue = track.queue;
    const { nowPlaying } = queue;
    if (!nowPlaying) return;

    track.playedAt = new Date();
    queue.history.unshift(nowPlaying);
    queue.history.splice(MAX_QUEUE_HISTORY_TRACKS);
  }
}
