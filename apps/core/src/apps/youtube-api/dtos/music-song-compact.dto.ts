import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { MusicSongCompact } from "youtubei";

import { MusicAlbumCompactDto } from "./music-album-compact.dto";
import { MusicBaseArtistDto } from "./music-base-artist.dto";
import { ThumbnailDto } from "./thumbnail.dto";

@Exclude()
export class MusicSongCompactDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  duration!: number;

  @Expose()
  @Type(() => ThumbnailDto)
  thumbnails!: ThumbnailDto[];

  @Expose()
  @Type(() => MusicBaseArtistDto)
  artists!: MusicBaseArtistDto[];

  @Expose()
  @Type(() => MusicAlbumCompactDto)
  album!: MusicAlbumCompactDto;

  public static create(entity: MusicSongCompact): MusicSongCompactDto {
    return plainToInstance(MusicSongCompactDto, entity);
  }
}
