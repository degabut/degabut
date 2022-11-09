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

  public async upsert(video: VideoCompact | VideoCompact[]): Promise<void> {
    const videos = Array.isArray(video) ? video : [video];
    const models = videos.map(VideoRepositoryMapper.toRepository);
    await this.videoModel.query().insert(models).onConflict("id").merge();
  }

  public async getById(id: string): Promise<VideoCompact | undefined> {
    const result = await this.videoModel.query().findById(id).withGraphJoined("channel");
    return result ? VideoRepositoryMapper.toDomainEntity(result) : undefined;
  }

  public async getByIds(ids: string[]): Promise<VideoCompact[]> {
    const results = await this.videoModel
      .query()
      .whereIn("video.id", ids)
      .withGraphJoined("channel");
    return results.map((r) => VideoRepositoryMapper.toDomainEntity(r));
  }
}
