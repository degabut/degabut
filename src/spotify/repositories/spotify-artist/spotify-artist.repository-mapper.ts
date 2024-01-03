import { SpotifyArtist } from "@spotify/entities";

import { SpotifyArtistModel, SpotifyArtistModelProps } from "./spotify-artist.model";

export class SpotifyArtistRepositoryMapper {
  public static toRepository(entity: SpotifyArtist): SpotifyArtistModelProps {
    return entity;
  }

  public static toDomainEntity(props: SpotifyArtistModel): SpotifyArtist {
    return new SpotifyArtist(props);
  }
}
