import { Inject } from "@nestjs/common";
import { Playlist } from "@playlist/entities";

import { PlaylistModel } from "./playlist.model";
import { PlaylistRepositoryMapper } from "./playlist.repository-mapper";

export class PlaylistRepository {
  constructor(
    @Inject(PlaylistModel)
    private readonly playlistModel: typeof PlaylistModel,
  ) {}

  public async insert(playlist: Playlist): Promise<Playlist> {
    const props = PlaylistRepositoryMapper.toRepository(playlist);
    const result = await this.playlistModel.query().insert(props).returning("*");
    return PlaylistRepositoryMapper.toDomainEntity(result);
  }

  public async delete(playlist: Playlist): Promise<void> {
    await this.playlistModel.query().deleteById(playlist.id);
  }

  public async update(playlist: Playlist): Promise<Playlist> {
    const props = PlaylistRepositoryMapper.toRepository(playlist);
    const [result] = await this.playlistModel
      .query()
      .update(props)
      .where("id", playlist.id)
      .returning("*");
    return PlaylistRepositoryMapper.toDomainEntity(result);
  }

  public async getByUserId(userId: string): Promise<Playlist[]> {
    const query = PlaylistModel.query().where({ owner_id: userId }).orderBy("created_at", "desc");
    const result = await query;

    return result.map(PlaylistRepositoryMapper.toDomainEntity);
  }

  public async getById(playlistId: string): Promise<Playlist | undefined> {
    const result = await this.playlistModel.query().findById(playlistId);
    return result ? PlaylistRepositoryMapper.toDomainEntity(result) : undefined;
  }

  public async getCountByUserId(userId: string): Promise<number> {
    const query = PlaylistModel.query().where({ owner_id: userId });
    return await query.resultSize();
  }
}
