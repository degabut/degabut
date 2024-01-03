import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubeVideo } from "../entities";
import { YoutubeChannelDto } from "./channel.dto";
import { YoutubeThumbnailDto } from "./thumbnail.dto";
import { YoutubeVideoCompactDto } from "./video-compact.dto";

@Exclude()
export class YoutubeVideoDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  duration!: number;

  @Expose()
  @Type(() => YoutubeThumbnailDto)
  thumbnails!: YoutubeThumbnailDto[];

  @Expose()
  viewCount!: number;

  @Expose()
  @Type(() => YoutubeChannelDto)
  channel!: YoutubeChannelDto;

  @Expose()
  @Type(() => YoutubeVideoCompactDto)
  related!: YoutubeVideoCompactDto[];

  public static create(entity: YoutubeVideo): YoutubeVideoDto {
    return plainToInstance(YoutubeVideoDto, entity);
  }
}
