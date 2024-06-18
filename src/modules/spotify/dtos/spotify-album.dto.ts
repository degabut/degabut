import { ImageDto } from "@common/dtos";
import { Exclude, Expose, Type, plainToInstance } from "class-transformer";

import { SpotifyAlbum } from "../entities";

@Exclude()
export class SpotifyAlbumDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  @Type(() => ImageDto)
  images!: ImageDto[];

  public static create(entity: SpotifyAlbum): SpotifyAlbumDto {
    return plainToInstance(SpotifyAlbumDto, entity);
  }
}
