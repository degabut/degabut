import { Inject, Injectable } from "@nestjs/common";
import { SpotifyTrack } from "@spotify/entities";

import { SpotifyTrackModel } from "./spotify-track.model";
import { SpotifyTrackRepositoryMapper } from "./spotify-track.repository-mapper";

@Injectable()
export class SpotifyTrackRepository {
  constructor(
    @Inject(SpotifyTrackModel)
    private readonly trackModel: typeof SpotifyTrackModel,
  ) {}

  public async upsert(track: SpotifyTrack | SpotifyTrack[]): Promise<void> {
    const tracks = Array.isArray(track) ? track : [track];
    const models = tracks.map(SpotifyTrackRepositoryMapper.toRepository);
    await this.trackModel.query().insert(models).onConflict("id").merge();
  }

  public async getById(id: string): Promise<SpotifyTrack | undefined> {
    const result = await this.trackModel
      .query()
      .findById(id)
      .withGraphJoined({ album: true, artists: true });

    return result ? SpotifyTrackRepositoryMapper.toDomainEntity(result) : undefined;
  }

  public async getByIds(ids: string[]): Promise<SpotifyTrack[]> {
    const results = await this.trackModel
      .query()
      .whereIn("spotify_track.id", ids)
      .withGraphJoined({ album: true, artists: true });
    return results.map((r) => SpotifyTrackRepositoryMapper.toDomainEntity(r));
  }
}
