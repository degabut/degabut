import { ImageDto } from "@common/dtos";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubeVideoCompact } from "../entities";
import { YoutubeChannelDto } from "./channel.dto";

@Exclude()
export class YoutubeVideoCompactDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  duration!: number;

  @Expose()
  @Type(() => ImageDto)
  thumbnails!: ImageDto[];

  @Expose()
  viewCount!: number;

  @Expose()
  @Type(() => YoutubeChannelDto)
  channel!: YoutubeChannelDto;

  public static create(entity: YoutubeVideoCompact): YoutubeVideoCompactDto {
    return plainToInstance(YoutubeVideoCompactDto, entity);
  }
}
