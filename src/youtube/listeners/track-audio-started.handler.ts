import { TrackAudioStartedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ChannelRepository, VideoRepository } from "@youtube/repositories";

@EventsHandler(TrackAudioStartedEvent)
export class TrackAudioStartedHandler implements IEventHandler<TrackAudioStartedEvent> {
  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly channelRepository: ChannelRepository,
  ) {}

  public async handle({ track }: TrackAudioStartedEvent): Promise<void> {
    const queue = track.queue;
    const { nowPlaying } = queue;
    if (!nowPlaying) return;

    await Promise.all([
      nowPlaying.video.channel && this.channelRepository.upsert(nowPlaying.video.channel),
      this.videoRepository.upsert(nowPlaying.video),
    ]);
  }
}
