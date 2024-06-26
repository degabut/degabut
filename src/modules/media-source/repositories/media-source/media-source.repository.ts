import { Inject, Injectable } from "@nestjs/common";

import { MediaSource } from "../../entities";
import { MediaSourceModel } from "./media-source.model";
import { MediaSourceRepositoryMapper } from "./media-source.repository-mapper";

type GetByContentIdOptions = {
  youtubeVideoId?: string;
  spotifyTrackId?: string;
};

@Injectable()
export class MediaSourceRepository {
  constructor(
    @Inject(MediaSourceModel)
    private readonly mediaSourceModel: typeof MediaSourceModel,
  ) {}

  public async upsert(source: MediaSource | MediaSource[]): Promise<void> {
    const sources = Array.isArray(source) ? source : [source];
    const props = sources.map((h) => MediaSourceRepositoryMapper.toRepository(h));
    await this.mediaSourceModel.query().insert(props).onConflict("id").merge();
  }

  public async getByContentId(id: GetByContentIdOptions): Promise<MediaSource | undefined> {
    if (!id.youtubeVideoId && !id.spotifyTrackId) return undefined;

    const findQuery: Record<string, string> = {};

    if (id.spotifyTrackId) findQuery.spotify_track_id = id.spotifyTrackId;
    if (id.youtubeVideoId) findQuery.youtube_video_id = id.youtubeVideoId;

    const props = await this.mediaSourceModel.query().findOne(findQuery);
    return props ? MediaSourceRepositoryMapper.toDomainEntity(props) : undefined;
  }

  public async getByIds(ids: string[]): Promise<MediaSource[]> {
    const props = await this.mediaSourceModel.query().findByIds(ids);
    return props.map((p) => MediaSourceRepositoryMapper.toDomainEntity(p));
  }
}
