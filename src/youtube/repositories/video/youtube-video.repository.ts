import { Inject, Injectable } from "@nestjs/common";
import { YoutubeVideoCompact } from "@youtube/entities";

import { YoutubeVideoModel } from "./youtube-video.model";
import { YoutubeVideoRepositoryMapper } from "./youtube-video.repository-mapper";

@Injectable()
export class YoutubeVideoRepository {
  constructor(
    @Inject(YoutubeVideoModel)
    private readonly videoModel: typeof YoutubeVideoModel,
  ) {}

  public async upsert(video: YoutubeVideoCompact | YoutubeVideoCompact[]): Promise<void> {
    const videos = Array.isArray(video) ? video : [video];
    const models = videos.map(YoutubeVideoRepositoryMapper.toRepository);
    await this.videoModel.query().insert(models).onConflict("id").merge();
  }

  public async getById(id: string): Promise<YoutubeVideoCompact | undefined> {
    const result = await this.videoModel.query().findById(id).withGraphJoined("channel");
    return result ? YoutubeVideoRepositoryMapper.toDomainEntity(result) : undefined;
  }

  public async getByIds(ids: string[]): Promise<YoutubeVideoCompact[]> {
    const results = await this.videoModel
      .query()
      .whereIn("video.id", ids)
      .withGraphJoined("channel");
    return results.map((r) => YoutubeVideoRepositoryMapper.toDomainEntity(r));
  }
}
