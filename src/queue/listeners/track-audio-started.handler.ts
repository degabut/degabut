import { TrackAudioStartedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserPlayHistory } from "@youtube/entities";
import {
  ChannelRepository,
  UserPlayHistoryRepository,
  VideoRepository,
} from "@youtube/repositories";

@EventsHandler(TrackAudioStartedEvent)
export class TrackAudioStartedHandler implements IEventHandler<TrackAudioStartedEvent> {
  constructor(
    private readonly userPlayHistoryRepository: UserPlayHistoryRepository,
    private readonly videoRepository: VideoRepository,
    private readonly channelRepository: ChannelRepository,
  ) {}

  public async handle({ track }: TrackAudioStartedEvent): Promise<void> {
    const queue = track.queue;
    const { nowPlaying } = queue;
    if (!nowPlaying) return;

    track.playedAt = new Date();
    queue.history.unshift(nowPlaying);
    queue.history.splice(25);

    await Promise.all([
      this.userPlayHistoryRepository.insert(
        new UserPlayHistory({
          playedAt: new Date(),
          userId: nowPlaying.requestedBy,
          videoId: nowPlaying.video.id,
        }),
      ),
      nowPlaying.video.channel && this.channelRepository.upsert(nowPlaying.video.channel),
      this.videoRepository.upsert(nowPlaying.video),
    ]);
  }
}
