import { Exclude, Expose, plainToInstance } from "class-transformer";
import { CaptionLanguage } from "youtubei/dist/typings/youtube/Caption";

@Exclude()
export class CaptionDto {
  @Expose()
  public name!: string;

  @Expose()
  public code!: string;

  @Expose()
  public url!: string;

  public static create(entity: CaptionLanguage): CaptionDto {
    return plainToInstance(CaptionDto, entity);
  }
}
