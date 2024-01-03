import { UserListenHistory, UserPlayHistory } from "@history/entities";
import { UserListenHistoryRepository, UserPlayHistoryRepository } from "@history/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAudioFinishedEvent } from "@queue-player/events";

@EventsHandler(TrackAudioFinishedEvent)
export class TrackAudioFinishedListener implements IEventHandler<TrackAudioFinishedEvent> {
  constructor(
    private readonly userPlayHistoryRepository: UserPlayHistoryRepository,
    private readonly userListenHistoryRepository: UserListenHistoryRepository,
  ) {}

  public async handle({ track }: TrackAudioFinishedEvent): Promise<void> {
    const requesterUserId = track.requestedBy?.id;
    const now = new Date();

    inVoice: if (requesterUserId) {
      const isRequesterInVoice = !!track.queue.getMember(requesterUserId);
      if (!isRequesterInVoice) break inVoice;

      await this.userPlayHistoryRepository.insert(
        new UserPlayHistory({
          userId: requesterUserId,
          mediaSourceId: track.mediaSource.id,
          guildId: track.queue.guild.id,
          voiceChannelId: track.queue.voiceChannelId,
          playedAt: now,
        }),
      );
    }

    const listeners = track.queue.voiceChannel.members.map((member) => member.id);
    if (listeners.length) {
      const listenHistories = listeners.map(
        (userId) =>
          new UserListenHistory({
            userId,
            mediaSourceId: track.mediaSource.id,
            guildId: track.queue.guild.id,
            voiceChannelId: track.queue.voiceChannelId,
            isRequester: userId === requesterUserId,
            listenedAt: now,
          }),
      );

      await this.userListenHistoryRepository.insert(listenHistories);
    }
  }
}
