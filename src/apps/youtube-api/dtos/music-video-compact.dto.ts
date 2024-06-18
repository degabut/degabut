import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { MusicVideoCompact } from "youtubei";

import { MusicBaseArtistDto } from "./music-base-artist.dto";
import { ThumbnailDto } from "./thumbnail.dto";

@Exclude()
export class MusicVideoCompactDto {
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

  public static create(entity: MusicVideoCompact): MusicVideoCompactDto {
    return plainToInstance(MusicVideoCompactDto, entity);
  }
}
