import { ArrayUtil } from "@common/utils";
import { MAX_MONTHLY_ACTIVITY_HISTORY } from "@history/history.constants";
import {
  UserMonthlyPlayActivityRepository,
  UserPlayHistoryRepository,
} from "@history/repositories";
import { MediaSource } from "@media-source/entities";
import { Inject } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Member, Queue, QueueAutoplayType } from "@queue/entities";
import { QueueAutoplayToggledEvent, QueueProcessedEvent } from "@queue/events";
import { UserLikeMediaSourceRepository } from "@user/repositories";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";
import * as dayjs from "dayjs";
import { Logger } from "nestjs-pino";

type AutoplayResult = {
  mediaSources: MediaSource[];
  member: Member | null;
};

@EventsHandler(QueueAutoplayToggledEvent, QueueProcessedEvent)
export class QueueAutoplayListener
  implements IEventHandler<QueueAutoplayToggledEvent | QueueProcessedEvent>
{
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

    const excludedAutoplayTypes: Set<QueueAutoplayType> = new Set(Queue.ALL_AUTOPLAY_TYPES);

    const { minDuration, maxDuration, types } = queue.autoplayOptions;
    let autoplayTypes: Set<QueueAutoplayType> = new Set(types);

    for (const t of types) {
      excludedAutoplayTypes.delete(t);
    }

    if (!autoplayTypes.size) {
      autoplayTypes = new Set(Queue.ALL_AUTOPLAY_TYPES);
    }

    let randomType: QueueAutoplayType | null = null;
    let result: AutoplayResult | null = null;

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
          result = await this.getQueueAutoplayMediaSources(queue, true);
          break;
        case "QUEUE_LAST_PLAYED_RELATED":
          result = await this.getQueueAutoplayMediaSources(queue, false);
          break;
        case "USER_RECENTLY_LIKED":
          result = await this.getUserRecentlyLikedMediaSources(queue, false);
          break;
        case "USER_RECENTLY_LIKED_RELATED":
          result = await this.getUserRecentlyLikedMediaSources(queue, true);
          break;
        case "USER_RECENTLY_PLAYED":
          result = await this.getUserRecentlyPlayedMediaSources(queue, false);
          break;
        case "USER_RECENTLY_PLAYED_RELATED":
          result = await this.getUserRecentlyPlayedMediaSources(queue, true);
          break;
        case "USER_RECENT_MOST_PLAYED":
          result = await this.getUserRecentMostPlayedMediaSources(queue, false);
          break;
        case "USER_RECENT_MOST_PLAYED_RELATED":
          result = await this.getUserRecentMostPlayedMediaSources(queue, true);
          break;
        case "USER_OLD_MOST_PLAYED":
          result = await this.getUserOldMostPlayedMediaSources(queue, false);
          break;
        case "USER_OLD_MOST_PLAYED_RELATED":
          result = await this.getUserOldMostPlayedMediaSources(queue, true);
          break;
        default:
          break;
      }

      if (result) {
        result.mediaSources = result.mediaSources.filter((m) => {
          if (queue.history.find((h) => h.mediaSource.id === m.id)) return false;
          if (minDuration || maxDuration) {
            return m.duration >= (minDuration || 0) && m.duration <= (maxDuration || Infinity);
          }
          return true;
        });
      }
    } while (randomType && !result?.mediaSources.length);

    if (!randomType || !result?.mediaSources.length) return;

    const randomMediaSource = ArrayUtil.pickRankedRandom(result.mediaSources);

    if (randomMediaSource) {
      queue.addTracks([randomMediaSource], false, { type: randomType, member: result.member });
    }
  }

  private async getQueueAutoplayMediaSources(
    queue: Queue,
    randomTrack: boolean,
  ): Promise<AutoplayResult | null> {
    if (!queue.history.length) return null;

    const track = randomTrack ? ArrayUtil.pickRandom(queue.history) : queue.history.at(0);
    if (!track?.mediaSource.playedYoutubeVideoId) return null;

    return {
      member: track.requestedBy,
      mediaSources: await this.getMixedTracks(track.mediaSource.playedYoutubeVideoId),
    };
  }

  private async getUserRecentlyLikedMediaSources(
    queue: Queue,
    isRelated: boolean,
  ): Promise<AutoplayResult | null> {
    const randomUser = ArrayUtil.pickRandom(queue.voiceChannel.activeMembers);
    if (!randomUser) return null;

    const likedTracks = await this.userLikeRepository.getByUserId(randomUser.id, {
      limit: 10,
      page: 1,
    });

    const mediaSources = likedTracks.filter((l) => l.mediaSource).map((l) => l.mediaSource!);

    if (isRelated) {
      return {
        member: randomUser,
        mediaSources: await this.getMixedTracks(
          ArrayUtil.pickRandom(mediaSources)?.playedYoutubeVideoId,
        ),
      };
    }

    return {
      member: randomUser,
      mediaSources,
    };
  }

  private async getUserRecentlyPlayedMediaSources(
    queue: Queue,
    isRelated: boolean,
  ): Promise<AutoplayResult | null> {
    const randomUser = ArrayUtil.pickRandom(queue.voiceChannel.activeMembers);
    if (!randomUser) return null;

    const playedTracks = await this.userPlayRepository.getLastPlayedByUserId(randomUser.id, {
      limit: 10,
      page: 1,
      includeContent: true,
      excludeIds: queue.history.map((h) => h.mediaSource.id),
    });

    const mediaSources = playedTracks.filter((p) => p.mediaSource).map((p) => p.mediaSource!);

    if (isRelated) {
      return {
        member: randomUser,
        mediaSources: await this.getMixedTracks(
          ArrayUtil.pickRandom(mediaSources)?.playedYoutubeVideoId,
        ),
      };
    }

    return {
      member: randomUser,
      mediaSources,
    };
  }

  private async getUserRecentMostPlayedMediaSources(
    queue: Queue,
    isRelated: boolean,
  ): Promise<AutoplayResult | null> {
    const randomUser = ArrayUtil.pickRandom(queue.voiceChannel.activeMembers);
    if (!randomUser) return null;

    const to = new Date();
    const from = dayjs(to).subtract(14, "days").toDate();

    const playedTracks = await this.userPlayRepository.getMostPlayedByUserId(randomUser.id, {
      limit: 20,
      from,
      to,
      includeContent: true,
      excludeIds: queue.history.map((h) => h.mediaSource.id),
    });

    const mediaSources = playedTracks.filter((p) => p.mediaSource).map((p) => p.mediaSource!);

    if (isRelated) {
      return {
        member: randomUser,
        mediaSources: await this.getMixedTracks(
          ArrayUtil.pickRandom(mediaSources)?.playedYoutubeVideoId,
        ),
      };
    }

    return {
      member: randomUser,
      mediaSources,
    };
  }

  private async getUserOldMostPlayedMediaSources(
    queue: Queue,
    isRelated: boolean,
  ): Promise<AutoplayResult | null> {
    const randomUser = ArrayUtil.pickRandom(queue.voiceChannel.activeMembers);
    if (!randomUser) return null;

    const now = new Date();
    const to = dayjs(now).subtract(6, "months").toDate();
    const from = dayjs(to).subtract(MAX_MONTHLY_ACTIVITY_HISTORY, "months").toDate();

    const monthlyPlayActivity = await this.userPlayActivityRepository.getActivity(
      randomUser.id,
      from,
      to,
    );
    if (!monthlyPlayActivity.length) return null;

    const randomMonth = ArrayUtil.pickRandom(
      monthlyPlayActivity.filter((a) => a.uniquePlayCount > 5),
    );
    if (!randomMonth) return null;

    const playedTracks = await this.userPlayRepository.getMostPlayedByUserId(randomUser.id, {
      limit: 20,
      from: dayjs(randomMonth.date).startOf("month").toDate(),
      to: dayjs(randomMonth.date).endOf("month").toDate(),
      includeContent: true,
      excludeIds: queue.history.map((h) => h.mediaSource.id),
    });

    const mediaSources = playedTracks.filter((p) => p.mediaSource).map((p) => p.mediaSource!);

    if (isRelated) {
      return {
        member: randomUser,
        mediaSources: await this.getMixedTracks(
          ArrayUtil.pickRandom(mediaSources)?.playedYoutubeVideoId,
        ),
      };
    }

    return {
      member: randomUser,
      mediaSources,
    };
  }

  private async getMixedTracks(id?: string | null): Promise<MediaSource[]> {
    if (!id) return [];

    try {
      const videos = await this.youtubeiProvider.getPlaylistVideos("RDAMVM" + id);
      return videos.map((v) => MediaSource.fromYoutube(v));
    } catch (err) {
      this.logger.error(`Failed to fetch mixed track for ${id}`, err);
      return [];
    }
  }
}
