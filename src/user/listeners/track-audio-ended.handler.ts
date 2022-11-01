import { TrackAudioEndedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserPlayHistory } from "@user/entities";
import { UserPlayHistoryRepository } from "@user/repositories";

@EventsHandler(TrackAudioEndedEvent)
export class TrackAudioEndedHandler implements IEventHandler<TrackAudioEndedEvent> {
  constructor(private readonly userPlayHistoryRepository: UserPlayHistoryRepository) {}

  public async handle({ track }: TrackAudioEndedEvent): Promise<void> {
    await this.userPlayHistoryRepository.insert(
      new UserPlayHistory({
        playedAt: new Date(),
        userId: track.requestedBy.id,
        guildId: track.queue.guildId,
        voiceChannelId: track.queue.voiceChannelId,
        videoId: track.video.id,
      }),
    );
  }
}
