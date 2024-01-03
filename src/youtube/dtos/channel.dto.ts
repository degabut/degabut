import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubeChannel } from "../entities";
import { YoutubeThumbnailDto } from "./thumbnail.dto";

@Exclude()
export class YoutubeChannelDto {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  @Type(() => YoutubeThumbnailDto)
  thumbnails!: YoutubeThumbnailDto[];

  public static create(entity: YoutubeChannel): YoutubeChannelDto {
    return plainToInstance(YoutubeChannelDto, entity);
  }
}
