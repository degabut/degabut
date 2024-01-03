import { Exclude, Expose, Type, plainToInstance } from "class-transformer";

import { SpotifyAlbum } from "../entities";
import { SpotifyImageDto } from "./spotify-image.dto";

@Exclude()
export class SpotifyAlbumDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  @Type(() => SpotifyImageDto)
  images!: SpotifyImageDto[];

  public static create(entity: SpotifyAlbum): SpotifyAlbumDto {
    return plainToInstance(SpotifyAlbumDto, entity);
  }
}
