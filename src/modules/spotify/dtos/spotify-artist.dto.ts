import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance } from "class-transformer";

import { SpotifyArtist } from "../entities";

@Exclude()
export class SpotifyArtistDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  name!: string;

  public static create(entity: SpotifyArtist): SpotifyArtistDto {
    return plainToInstance(SpotifyArtistDto, entity);
  }
}
