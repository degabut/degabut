import { Inject, Injectable } from "@nestjs/common";
import { SpotifyAlbumCompact } from "@spotify/entities";

import { SpotifyAlbumModel } from "./spotify-album.model";
import { SpotifyAlbumRepositoryMapper } from "./spotify-album.repository-mapper";

@Injectable()
export class SpotifyAlbumRepository {
  constructor(
    @Inject(SpotifyAlbumModel)
    private readonly albumModel: typeof SpotifyAlbumModel,
  ) {}

  public async upsert(album: SpotifyAlbumCompact | SpotifyAlbumCompact[]): Promise<void> {
    const albums = Array.isArray(album) ? album : [album];
    const models = albums.map(SpotifyAlbumRepositoryMapper.toRepository);
    await this.albumModel.query().insert(models).onConflict("id").merge();
  }
}
