import { Inject, Injectable } from "@nestjs/common";
import { PlaylistVideo } from "@playlist/entities";

import { PlaylistVideoModel } from "./playlist-video.model";
import { PlaylistVideoRepositoryMapper } from "./playlist-video.repository-mapper";

@Injectable()
export class PlaylistVideoRepository {
  constructor(
    @Inject(PlaylistVideoModel)
    private readonly playlistVideoModel: typeof PlaylistVideoModel,
  ) {}

  public async insert(playlistVideo: PlaylistVideo): Promise<PlaylistVideo> {
    const props = PlaylistVideoRepositoryMapper.toRepository(playlistVideo);
    const result = await this.playlistVideoModel.query().insert(props).returning("*");
    return PlaylistVideoRepositoryMapper.toDomainEntity(result);
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.playlistVideoModel.query().deleteById(id);
    return result > 0;
  }

  public async getById(id: string): Promise<PlaylistVideo | undefined> {
    const result = await PlaylistVideoModel.query().findById(id);
    return result ? PlaylistVideoRepositoryMapper.toDomainEntity(result) : undefined;
  }

  public async getByPlaylistId(playlistId: string): Promise<PlaylistVideo[]> {
    const query = this.playlistVideoModel
      .query()
      .where({ playlist_id: playlistId })
      .withGraphJoined("video")
      .withGraphJoined("video.channel");
    const result = await query;
    return result.map(PlaylistVideoRepositoryMapper.toDomainEntity);
  }

  public async getCountByPlaylistId(playlistId: string): Promise<number> {
    const query = this.playlistVideoModel.query().where({ playlist_id: playlistId });
    return await query.resultSize();
  }
}
