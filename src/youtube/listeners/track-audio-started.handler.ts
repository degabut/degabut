import { TrackAudioStartedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { YoutubeCachedService } from "@youtube/services";

@EventsHandler(TrackAudioStartedEvent)
export class TrackAudioStartedHandler implements IEventHandler<TrackAudioStartedEvent> {
  constructor(private readonly youtubeService: YoutubeCachedService) {}

  public async handle({ track }: TrackAudioStartedEvent): Promise<void> {
    const queue = track.queue;
    const { nowPlaying } = queue;
    if (!nowPlaying) return;

    await this.youtubeService.cacheVideo(nowPlaying.video);
  }
}
