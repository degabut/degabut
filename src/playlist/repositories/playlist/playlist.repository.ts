import { Playlist } from "@playlist/entities";

import { PlaylistModel } from "./playlist.model";
import { PlaylistRepositoryMapper } from "./playlist.repository-mapper";

export class PlaylistRepository {
  public async insert(playlist: Playlist): Promise<Playlist> {
    const props = PlaylistRepositoryMapper.toRepository(playlist);
    const result = await PlaylistModel.query().insert(props).returning("*");
    return PlaylistRepositoryMapper.toDomainEntity(result);
  }

  public async delete(playlist: Playlist): Promise<void> {
    await PlaylistModel.query().deleteById(playlist.id);
  }

  public async update(playlist: Playlist): Promise<Playlist> {
    const props = PlaylistRepositoryMapper.toRepository(playlist);
    const [result] = await PlaylistModel.query()
      .update(props)
      .where("id", playlist.id)
      .returning("*");
    return PlaylistRepositoryMapper.toDomainEntity(result);
  }

  public async getByUserId(userId: string): Promise<Playlist[]> {
    const query = PlaylistModel.query().where({ owner_id: userId });
    const result = await query;

    return result.map(PlaylistRepositoryMapper.toDomainEntity);
  }

  public async getById(playlistId: string): Promise<Playlist | undefined> {
    const result = await PlaylistModel.query().findById(playlistId);
    return result ? PlaylistRepositoryMapper.toDomainEntity(result) : undefined;
  }

  public async getCountByUserId(userId: string): Promise<number> {
    const query = PlaylistModel.query().where({ owner_id: userId });
    return await query.resultSize();
  }
}
