import { UserPlayHistory } from "@history/entities";
import { UserPlayHistoryRepository } from "@history/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAudioFinishedEvent } from "@queue-player/events";

@EventsHandler(TrackAudioFinishedEvent)
export class TrackAudioFinishedListener implements IEventHandler<TrackAudioFinishedEvent> {
  constructor(private readonly userPlayHistoryRepository: UserPlayHistoryRepository) {}

  public async handle({ track }: TrackAudioFinishedEvent): Promise<void> {
    const userId = track.requestedBy?.id;
    if (!userId) return;

    const isUserInVoice = !!track.queue.getMember(userId);
    if (!isUserInVoice) return;

    await this.userPlayHistoryRepository.insert(
      new UserPlayHistory({
        playedAt: new Date(),
        userId,
        guildId: track.queue.guild.id,
        voiceChannelId: track.queue.voiceChannelId,
        videoId: track.video.id,
      }),
    );
  }
}
