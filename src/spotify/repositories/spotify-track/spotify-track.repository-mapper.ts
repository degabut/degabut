import { SpotifyTrack } from "@spotify/entities";

import { SpotifyAlbumRepositoryMapper } from "../spotify-album";
import { SpotifyArtistRepositoryMapper } from "../spotify-artist";
import { SpotifyTrackModel, SpotifyTrackModelProps } from "./spotify-track.model";

export class SpotifyTrackRepositoryMapper {
  public static toRepository(entity: SpotifyTrack): SpotifyTrackModelProps {
    return entity;
  }

  public static toDomainEntity(props: SpotifyTrackModel): SpotifyTrack {
    const entity = new SpotifyTrack({
      ...props,
      album: SpotifyAlbumRepositoryMapper.toDomainEntity(props.album),
      artists: props.artists.map((artist) => SpotifyArtistRepositoryMapper.toDomainEntity(artist)),
    });

    return entity;
  }
}
