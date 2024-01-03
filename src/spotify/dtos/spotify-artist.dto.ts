import { Exclude, Expose, plainToInstance } from "class-transformer";

import { SpotifyArtist } from "../entities";

@Exclude()
export class SpotifyArtistDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  public static create(entity: SpotifyArtist): SpotifyArtistDto {
    return plainToInstance(SpotifyArtistDto, entity);
  }
}
