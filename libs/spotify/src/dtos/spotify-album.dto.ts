import { ImageDto } from "@common/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type, plainToInstance } from "class-transformer";

import { SpotifyAlbum } from "../entities";

@Exclude()
export class SpotifyAlbumDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  name!: string;

  @Expose()
  @Type(() => ImageDto)
  @ApiProperty({ type: [ImageDto] })
  images!: ImageDto[];

  public static create(entity: SpotifyAlbum): SpotifyAlbumDto {
    return plainToInstance(SpotifyAlbumDto, entity);
  }
}
