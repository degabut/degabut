import { SpotifyAlbumCompact } from "@spotify/entities";

import { SpotifyAlbumModel, SpotifyAlbumModelProps } from "./spotify-album.model";

export class SpotifyAlbumRepositoryMapper {
  public static toRepository(entity: SpotifyAlbumCompact): SpotifyAlbumModelProps {
    return entity;
  }

  public static toDomainEntity(props: SpotifyAlbumModel): SpotifyAlbumCompact {
    return new SpotifyAlbumCompact(props);
  }
}
