import { Exclude, Expose, plainToInstance } from "class-transformer";
import { MusicLyrics } from "youtubei";

@Exclude()
export class MusicLyricsDto {
  @Expose()
  content!: string;

  @Expose()
  description!: string;

  public static create(entity: MusicLyrics): MusicLyricsDto {
    return plainToInstance(MusicLyricsDto, entity);
  }
}
