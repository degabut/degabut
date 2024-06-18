import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { MusicAlbumCompact } from "youtubei";

import { MusicBaseArtistDto } from "./music-base-artist.dto";
import { ThumbnailDto } from "./thumbnail.dto";

@Exclude()
export class MusicAlbumCompactDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  year!: number;

  @Expose()
  @Type(() => ThumbnailDto)
  thumbnails!: ThumbnailDto[];

  @Expose()
  @Type(() => MusicBaseArtistDto)
  artists!: MusicBaseArtistDto[];

  public static create(entity: MusicAlbumCompact): MusicAlbumCompactDto {
    return plainToInstance(MusicAlbumCompactDto, entity);
  }
}
