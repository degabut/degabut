import { Inject, Injectable } from "@nestjs/common";
import { VideoCompact } from "@youtube/entities";

import { UserPlayHistoryModel } from "../user-play-history";
import { VideoModel } from "./video.model";
import { VideoRepositoryMapper } from "./video.repository-mapper";

@Injectable()
export class VideoRepository {
  constructor(
    @Inject(VideoModel)
    private readonly videoModel: typeof VideoModel,

    @Inject(UserPlayHistoryModel)
    private readonly userPlayHistoryModel: typeof UserPlayHistoryModel,
  ) {}

  public async upsert(video: VideoCompact): Promise<void> {
    const model = VideoRepositoryMapper.toRepository(video);
    await this.videoModel.query().insert(model).onConflict("id").merge();
  }

  public async getLastPlayedVideos(userId: string, count: number): Promise<VideoCompact[]> {
    const results = await this.userPlayHistoryModel
      .query()
      .from((builder) => {
        builder
          .from(UserPlayHistoryModel.tableName)
          .distinctOn("video_id")
          .where({ user_id: userId })
          .orderBy("video_id")
          .orderBy("played_at", "desc")
          .as("user_play_history");
      })
      .orderBy("played_at", "desc")
      .limit(count)
      .withGraphFetched("video")
      .withGraphFetched("video.channel");

    return results.map((r) => VideoRepositoryMapper.toDomainEntity(r.video as VideoModel));
  }

  public async getMostPlayedVideos(
    userId: string,
    options: { from?: Date; to?: Date; count?: number } = {},
  ): Promise<VideoCompact[]> {
    const results = await this.userPlayHistoryModel
      .query()
      .select("video_id")
      .count("video_id as count")
      .where({ user_id: userId })
      .groupBy("user_play_history.video_id")
      .orderBy("count", "desc")
      .withGraphFetched("video")
      .withGraphFetched("video.channel")
      .modify((builder) => {
        const { from, to, count } = options;
        if (from) builder.where("played_at", ">=", from);
        if (to) builder.where("played_at", "<=", to);
        if (count) builder.limit(count);
      });

    return results.map((r) => VideoRepositoryMapper.toDomainEntity(r.video as VideoModel));
  }
}
