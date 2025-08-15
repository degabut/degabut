import { ArrayUtil } from "@common/utils";
import { MAX_MONTHLY_ACTIVITY_HISTORY } from "@history/history.constants";
import {
  UserMonthlyPlayActivityRepository,
  UserPlayHistoryRepository,
} from "@history/repositories";
import { Logger } from "@logger/logger.service";
import { MediaSource } from "@media-source/entities";
import { Inject } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Queue } from "@queue/entities";
import { QueueProcessedEvent } from "@queue/events";
import { UserLikeMediaSourceRepository } from "@user/repositories";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";
import * as dayjs from "dayjs";

type AutoplayType =
  | "RELATED"
  | "USER_RECENTLY_LIKED"
  | "USER_RECENTLY_PLAYED"
  | "USER_RECENT_MOST_PLAYED"
  | "USER_OLD_MOST_PLAYED";

@EventsHandler(QueueProcessedEvent)
export class QueueProcessedListener implements IEventHandler<QueueProcessedEvent> {
  private autoplayTypes: AutoplayType[] = [
    "RELATED",
    "USER_RECENTLY_LIKED",
    "USER_RECENTLY_PLAYED",
    "USER_RECENT_MOST_PLAYED",
    "USER_OLD_MOST_PLAYED",
  ];

  constructor(
    private readonly logger: Logger,
    @Inject(YOUTUBEI_PROVIDER)
    private readonly youtubeiProvider: IYoutubeiProvider,
    private readonly userLikeRepository: UserLikeMediaSourceRepository,
    private readonly userPlayRepository: UserPlayHistoryRepository,
    private readonly userPlayActivityRepository: UserMonthlyPlayActivityRepository,
  ) {}

  public async handle({ queue }: QueueProcessedEvent): Promise<void> {
    if (!queue.autoplay || queue.nowPlaying) return;

    const autoplayTypes = [...this.autoplayTypes];
    let randomType: AutoplayType | null = null;
    let mediaSources: MediaSource[] = [];

    do {
      randomType = autoplayTypes.splice(ArrayUtil.randomIndex(autoplayTypes), 1)[0];

      switch (randomType) {
        case "RELATED":
          mediaSources = await this.getRelatedTracks(queue);
          break;
        case "USER_RECENTLY_LIKED":
          mediaSources = await this.getUserRecentlyLikedTracks(queue);
          break;
        case "USER_RECENTLY_PLAYED":
          mediaSources = await this.getUserRecentlyPlayedTracks(queue);
          break;
        case "USER_RECENT_MOST_PLAYED":
          mediaSources = await this.getUserRecentMostPlayedTracks(queue);
          break;
        case "USER_OLD_MOST_PLAYED":
          mediaSources = await this.getUserOldMostPlayedTracks(queue);
          break;
        default:
          randomType = null;
          break;
      }
    } while (randomType && !mediaSources.length);

    if (!mediaSources.length) return;
    const filteredMediaSources = mediaSources.filter(
      (m) => !queue.history.find((h) => h.mediaSource.id === m.id),
    );

    const randomMediaSource = ArrayUtil.pickRandom(filteredMediaSources);

    if (randomMediaSource) {
      queue.addTracks([randomMediaSource], false);
    }
  }

  private async getRelatedTracks(queue: Queue): Promise<MediaSource[]> {
    if (!queue.history.length) return [];

    const track = ArrayUtil.pickRandom(queue.history);
    if (!track?.mediaSource.playedYoutubeVideoId) return [];

    try {
      const video = await this.youtubeiProvider.getVideo(track.mediaSource.playedYoutubeVideoId);
      if (!video) return [];

      return video.related.map((v) => MediaSource.fromYoutube(v));
    } catch (err) {
      this.logger.error("Failed to autoplay from related tracks", err);
      return [];
    }
  }

  private async getUserRecentlyLikedTracks(queue: Queue): Promise<MediaSource[]> {
    const randomUser = ArrayUtil.pickRandom(queue.voiceChannel.activeMembers);
    if (!randomUser) return [];

    const likedTracks = await this.userLikeRepository.getByUserId(randomUser.id, {
      limit: 10,
      page: 1,
    });

    return likedTracks.filter((l) => l.mediaSource).map((l) => l.mediaSource!);
  }

  private async getUserRecentlyPlayedTracks(queue: Queue): Promise<MediaSource[]> {
    const randomUser = ArrayUtil.pickRandom(queue.voiceChannel.activeMembers);
    if (!randomUser) return [];

    const playedTracks = await this.userPlayRepository.getLastPlayedByUserId(randomUser.id, {
      limit: 10,
      page: 1,
      includeContent: true,
      excludeIds: queue.history.map((h) => h.mediaSource.id),
    });

    return playedTracks.filter((p) => p.mediaSource).map((p) => p.mediaSource!);
  }

  private async getUserRecentMostPlayedTracks(queue: Queue): Promise<MediaSource[]> {
    const randomUser = ArrayUtil.pickRandom(queue.voiceChannel.activeMembers);
    if (!randomUser) return [];

    const to = new Date();
    const from = dayjs(to).subtract(14, "days").toDate();

    const playedTracks = await this.userPlayRepository.getMostPlayedByUserId(randomUser.id, {
      limit: 10,
      from,
      to,
      includeContent: true,
      excludeIds: queue.history.map((h) => h.mediaSource.id),
    });

    return playedTracks.filter((p) => p.mediaSource).map((p) => p.mediaSource!);
  }

  private async getUserOldMostPlayedTracks(queue: Queue): Promise<MediaSource[]> {
    const randomUser = ArrayUtil.pickRandom(queue.voiceChannel.activeMembers);
    if (!randomUser) return [];

    const now = new Date();
    const to = dayjs(now).subtract(6, "months").toDate();
    const from = dayjs(to).subtract(MAX_MONTHLY_ACTIVITY_HISTORY, "months").toDate();

    const monthlyPlayActivity = await this.userPlayActivityRepository.getActivity(
      randomUser.id,
      from,
      to,
    );
    if (!monthlyPlayActivity.length) return [];

    const randomMonth = ArrayUtil.pickRandom(
      monthlyPlayActivity.filter((a) => a.uniquePlayCount > 5),
    );
    if (!randomMonth) return [];

    const playedTracks = await this.userPlayRepository.getMostPlayedByUserId(randomUser.id, {
      limit: 10,
      from: dayjs(randomMonth.date).startOf("month").toDate(),
      to: dayjs(randomMonth.date).endOf("month").toDate(),
      includeContent: true,
      excludeIds: queue.history.map((h) => h.mediaSource.id),
    });

    return playedTracks.filter((p) => p.mediaSource).map((p) => p.mediaSource!);
  }
}
