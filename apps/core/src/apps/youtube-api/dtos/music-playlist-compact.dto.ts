import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { MusicPlaylistCompact } from "youtubei";

import { MusicBaseArtistDto } from "./music-base-artist.dto";
import { ThumbnailDto } from "./thumbnail.dto";

@Exclude()
export class MusicPlaylistCompactDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  songCount!: number;

  @Expose()
  @Type(() => ThumbnailDto)
  thumbnails!: ThumbnailDto[];

  @Expose()
  @Type(() => MusicBaseArtistDto)
  channel!: MusicBaseArtistDto;

  public static create(entity: MusicPlaylistCompact): MusicPlaylistCompactDto {
    return plainToInstance(MusicPlaylistCompactDto, entity);
  }
}
