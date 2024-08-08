import { Inject, Injectable } from "@nestjs/common";
import { SpotifyArtist } from "@spotify/entities";

import { SpotifyArtistModel } from "./spotify-artist.model";
import { SpotifyArtistRepositoryMapper } from "./spotify-artist.repository-mapper";

@Injectable()
export class SpotifyArtistRepository {
  constructor(
    @Inject(SpotifyArtistModel)
    private readonly artistModel: typeof SpotifyArtistModel,
  ) {}

  public async upsert(artist: SpotifyArtist | SpotifyArtist[]): Promise<void> {
    const artists = Array.isArray(artist) ? artist : [artist];
    const models = artists.map(SpotifyArtistRepositoryMapper.toRepository);
    await this.artistModel.query().insert(models).onConflict("id").merge();
  }
}
