import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { SpotifyTrack } from "../entities";
import { SpotifyAlbumDto } from "./spotify-album.dto";
import { SpotifyArtistDto } from "./spotify-artist.dto";

@Exclude()
export class SpotifyTrackDto {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public duration!: number;

  @Expose()
  @Type(() => SpotifyArtistDto)
  public artists!: SpotifyArtistDto[];

  @Expose()
  @Type(() => SpotifyAlbumDto)
  public album!: SpotifyAlbumDto;

  public static create(entity: SpotifyTrack): SpotifyTrackDto {
    return plainToInstance(SpotifyTrackDto, entity);
  }
}
