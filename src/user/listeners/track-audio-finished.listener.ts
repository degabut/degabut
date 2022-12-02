import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAudioFinishedEvent } from "@queue-player/events";
import { UserPlayHistory } from "@user/entities";
import { UserPlayHistoryRepository } from "@user/repositories";

@EventsHandler(TrackAudioFinishedEvent)
export class TrackAudioFinishedListener implements IEventHandler<TrackAudioFinishedEvent> {
  constructor(private readonly userPlayHistoryRepository: UserPlayHistoryRepository) {}

  public async handle({ track }: TrackAudioFinishedEvent): Promise<void> {
    const userId = track.requestedBy.id;
    const isUserInVoice = !!track.queue.getMember(userId);
    if (!isUserInVoice) return;

    await this.userPlayHistoryRepository.insert(
      new UserPlayHistory({
        playedAt: new Date(),
        userId,
        guildId: track.queue.guildId,
        voiceChannelId: track.queue.voiceChannelId,
        videoId: track.video.id,
      }),
    );
  }
}
