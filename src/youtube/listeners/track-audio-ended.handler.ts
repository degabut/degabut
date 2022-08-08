import { TrackAudioEndedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserPlayHistory } from "@youtube/entities";
import { UserPlayHistoryRepository } from "@youtube/repositories";

@EventsHandler(TrackAudioEndedEvent)
export class TrackAudioEndedHandler implements IEventHandler<TrackAudioEndedEvent> {
  constructor(private readonly userPlayHistoryRepository: UserPlayHistoryRepository) {}

  public async handle({ track }: TrackAudioEndedEvent): Promise<void> {
    await this.userPlayHistoryRepository.insert(
      new UserPlayHistory({
        playedAt: new Date(),
        userId: track.requestedBy,
        videoId: track.video.id,
      }),
    );
  }
}
