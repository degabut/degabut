import { ArrayUtil } from "@common/utils";
import { MAX_MONTHLY_ACTIVITY_HISTORY } from "@history/history.constants";
import {
  UserMonthlyPlayActivityRepository,
  UserPlayHistoryRepository,
} from "@history/repositories";
import { MediaSource } from "@media-source/entities";
import { Inject } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Queue } from "@queue/entities";
import { QueueAutoplayToggledEvent, QueueProcessedEvent } from "@queue/events";
import { UserLikeMediaSourceRepository } from "@user/repositories";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";
import * as dayjs from "dayjs";
import { Logger } from "nestjs-pino";

type AutoplayType =
  | "QUEUE_RELATED"
  | "QUEUE_LAST_PLAYED_RELATED"
  | "USER_RECENTLY_LIKED"
  | "USER_RECENTLY_PLAYED"
  | "USER_RECENT_MOST_PLAYED"
  | "USER_OLD_MOST_PLAYED";

@EventsHandler(QueueAutoplayToggledEvent, QueueProcessedEvent)
export class QueueAutoplayListener
  implements IEventHandler<QueueAutoplayToggledEvent | QueueProcessedEvent>
{
  private allAutoplayTypes: AutoplayType[] = [
    "QUEUE_RELATED",
    "QUEUE_LAST_PLAYED_RELATED",
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

    const excludedAutoplayTypes: Set<AutoplayType> = new Set(this.allAutoplayTypes);
    const autoplayTypes: Set<AutoplayType> = new Set();

    const {
      includeQueueLastPlayedRelated,
      includeQueueRelated,
      includeUserLibrary,
      minDuration,
      maxDuration,
    } = queue.autoplayOptions;

    if (includeQueueLastPlayedRelated) {
      excludedAutoplayTypes.delete("QUEUE_LAST_PLAYED_RELATED");
      autoplayTypes.add("QUEUE_LAST_PLAYED_RELATED");
    }

    if (includeQueueRelated) {
      excludedAutoplayTypes.delete("QUEUE_RELATED");
      autoplayTypes.add("QUEUE_RELATED");
    }

    if (includeUserLibrary) {
      const userTypes: AutoplayType[] = [
        "USER_RECENTLY_LIKED",
        "USER_RECENTLY_PLAYED",
        "USER_RECENT_MOST_PLAYED",
        "USER_OLD_MOST_PLAYED",
      ];
      userTypes.forEach((t) => {
        excludedAutoplayTypes.delete(t);
        autoplayTypes.add(t);
      });
    }

    if (!autoplayTypes.size) {
      this.allAutoplayTypes.forEach((t) => {
        autoplayTypes.add(t);
      });
    }

    let randomType: AutoplayType | null = null;
    let mediaSources: MediaSource[] = [];

    do {
      if (!autoplayTypes.size && excludedAutoplayTypes.size) {
        for (const t of excludedAutoplayTypes) {
          excludedAutoplayTypes.delete(t);
          autoplayTypes.add(t);
        }
      }

      randomType = ArrayUtil.pickRandom(autoplayTypes) || null;
      if (randomType) autoplayTypes.delete(randomType);

      switch (randomType) {
        case "QUEUE_RELATED":
          mediaSources = await this.getMixedTracks(queue, true);
          break;
        case "QUEUE_LAST_PLAYED_RELATED":
          mediaSources = await this.getMixedTracks(queue, false);
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
          break;
      }

      mediaSources = mediaSources.filter((m) => {
        if (queue.history.find((h) => h.mediaSource.id === m.id)) return false;
        if (minDuration || maxDuration) {
          return m.duration >= minDuration && m.duration <= maxDuration;
        }
        return true;
      });
    } while (randomType && !mediaSources.length);

    if (!mediaSources.length) return;

    const randomMediaSource = ArrayUtil.pickRankedRandom(mediaSources);

    if (randomMediaSource) {
      queue.addTracks([randomMediaSource], false);
    }
  }

  private async getMixedTracks(queue: Queue, randomTrack: boolean): Promise<MediaSource[]> {
    if (!queue.history.length) return [];

    const track = randomTrack ? ArrayUtil.pickRandom(queue.history) : queue.history.at(0);
    if (!track?.mediaSource.playedYoutubeVideoId) return [];

    try {
      const videos = await this.youtubeiProvider.getPlaylistVideos(
        "RDAMVM" + track.mediaSource.playedYoutubeVideoId,
      );
      return videos.map((v) => MediaSource.fromYoutube(v));
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
      limit: 20,
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
      limit: 20,
      from: dayjs(randomMonth.date).startOf("month").toDate(),
      to: dayjs(randomMonth.date).endOf("month").toDate(),
      includeContent: true,
      excludeIds: queue.history.map((h) => h.mediaSource.id),
    });

    return playedTracks.filter((p) => p.mediaSource).map((p) => p.mediaSource!);
  }
}
