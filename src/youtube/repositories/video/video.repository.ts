import { Inject, Injectable } from "@nestjs/common";
import { VideoCompact } from "@youtube/entities";

import { VideoModel } from "./video.model";
import { VideoRepositoryMapper } from "./video.repository-mapper";

@Injectable()
export class VideoRepository {
  constructor(
    @Inject(VideoModel)
    private readonly videoModel: typeof VideoModel,
  ) {}

  public async upsert(video: VideoCompact): Promise<void> {
    const model = VideoRepositoryMapper.toRepository(video);
    await this.videoModel.query().insert(model).onConflict("id").merge();
  }

  public async getByIds(ids: string[]): Promise<VideoCompact[]> {
    const results = await this.videoModel
      .query()
      .whereIn("video.id", ids)
      .withGraphJoined("channel");
    return results.map((r) => VideoRepositoryMapper.toDomainEntity(r));
  }
}
