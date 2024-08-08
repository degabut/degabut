import { Exclude, Expose, Type, plainToInstance } from "class-transformer";
import { MusicSearchResult } from "youtubei/dist/typings/music/MusicSearchResult";

import { MusicSongCompactDto } from "./music-song-compact.dto";

@Exclude()
export class MusicSongsDto {
  @Expose()
  @Type(() => MusicSongCompactDto)
  items!: MusicSongCompactDto[];

  @Expose()
  continuation!: string | null;

  public static create(entity: MusicSearchResult<"song">): MusicSongsDto {
    return plainToInstance(MusicSongsDto, {
      items: entity.items,
      continuation: entity.continuation || null,
    });
  }
}
