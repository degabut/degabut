import { Exclude, Expose, plainToInstance } from "class-transformer";

import { YoutubeThumbnail } from "../entities";

@Exclude()
export class YoutubeThumbnailDto {
  @Expose()
  url!: string;

  @Expose()
  width!: number;

  @Expose()
  height!: number;

  public static create(entity: YoutubeThumbnail): YoutubeThumbnailDto {
    return plainToInstance(YoutubeThumbnailDto, entity);
  }
}
