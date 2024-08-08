import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { SpotifyTrack } from "../entities";
import { SpotifyAlbumDto } from "./spotify-album.dto";
import { SpotifyArtistDto } from "./spotify-artist.dto";

@Exclude()
export class SpotifyTrackDto {
  @Expose()
  @ApiProperty()
  public id!: string;

  @Expose()
  @ApiProperty()
  public name!: string;

  @Expose()
  @ApiProperty()
  public duration!: number;

  @Expose()
  @Type(() => SpotifyArtistDto)
  @ApiProperty({ type: [SpotifyArtistDto] })
  public artists!: SpotifyArtistDto[];

  @Expose()
  @Type(() => SpotifyAlbumDto)
  @ApiProperty({ type: SpotifyAlbumDto })
  public album!: SpotifyAlbumDto;

  public static create(entity: SpotifyTrack): SpotifyTrackDto {
    return plainToInstance(SpotifyTrackDto, entity);
  }
}
