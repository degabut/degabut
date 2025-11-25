import { LyricsSources } from "@lyrics/lyrics.constants";
import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class LyricsDto {
  @Expose()
  public source!: LyricsSources;

  @Expose()
  public richSynced!: string | null;

  @Expose()
  public synced!: string | null;

  @Expose()
  public unsynced!: string | null;

  @Expose()
  public duration!: number;

  public static create(entity: LyricsDto): LyricsDto {
    return plainToInstance(LyricsDto, entity);
  }
}
