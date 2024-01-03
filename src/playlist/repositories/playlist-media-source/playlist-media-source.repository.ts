import { Inject, Injectable } from "@nestjs/common";
import { PlaylistMediaSource } from "@playlist/entities";

import { PlaylistMediaSourceModel } from "./playlist-media-source.model";
import { PlaylistMediaSourceRepositoryMapper } from "./playlist-media-source.repository-mapper";

@Injectable()
export class PlaylistMediaSourceRepository {
  constructor(
    @Inject(PlaylistMediaSourceModel)
    private readonly playlistMediaSource: typeof PlaylistMediaSourceModel,
  ) {}

  public async insert(playlistMediaSource: PlaylistMediaSource): Promise<PlaylistMediaSource> {
    const props = PlaylistMediaSourceRepositoryMapper.toRepository(playlistMediaSource);
    const result = await this.playlistMediaSource.query().insert(props).returning("*");
    return PlaylistMediaSourceRepositoryMapper.toDomainEntity(result);
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.playlistMediaSource.query().deleteById(id);
    return result > 0;
  }

  public async deleteByPlaylistId(playlistId: string): Promise<boolean> {
    const result = await this.playlistMediaSource
      .query()
      .delete()
      .where({ playlist_id: playlistId });
    return result > 0;
  }

  public async getById(id: string): Promise<PlaylistMediaSource | undefined> {
    const result = await PlaylistMediaSourceModel.query().findById(id);
    return result ? PlaylistMediaSourceRepositoryMapper.toDomainEntity(result) : undefined;
  }

  public async getByPlaylistId(playlistId: string): Promise<PlaylistMediaSource[]> {
    const query = this.playlistMediaSource
      .query()
      .where({ playlist_id: playlistId })
      .withGraphJoined("mediaSource")
      .withGraphJoined("mediaSource.youtubeVideo")
      .withGraphJoined("mediaSource.youtubeVideo.channel")
      .withGraphJoined("mediaSource.spotifyTrack")
      .withGraphJoined("mediaSource.spotifyTrack.album")
      .withGraphFetched("mediaSource.spotifyTrack.artists");
    const result = await query;
    return result.map(PlaylistMediaSourceRepositoryMapper.toDomainEntity);
  }

  public async getCountByPlaylistId(playlistId: string): Promise<number> {
    const query = this.playlistMediaSource.query().where({ playlist_id: playlistId });
    return await query.resultSize();
  }
}
