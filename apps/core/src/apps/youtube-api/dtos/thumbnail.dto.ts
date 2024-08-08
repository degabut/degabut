import { Exclude, Expose, plainToInstance } from "class-transformer";
import { Thumbnail } from "youtubei";

@Exclude()
export class ThumbnailDto {
  @Expose()
  url!: string;

  @Expose()
  width!: number;

  @Expose()
  height!: number;

  public static create(entity: Thumbnail): ThumbnailDto {
    return plainToInstance(ThumbnailDto, entity);
  }
}
