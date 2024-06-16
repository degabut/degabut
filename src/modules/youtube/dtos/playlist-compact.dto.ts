import { ImageDto } from "@common/dtos";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubePlaylistCompact } from "../entities";
import { YoutubeChannelDto } from "./channel.dto";

@Exclude()
export class YoutubePlaylistCompactDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  videoCount!: number;

  @Expose()
  @Type(() => ImageDto)
  thumbnails!: ImageDto[];

  @Expose()
  @Type(() => YoutubeChannelDto)
  channel!: YoutubeChannelDto;

  public static create(entity: YoutubePlaylistCompact): YoutubePlaylistCompactDto {
    return plainToInstance(YoutubePlaylistCompactDto, entity);
  }
}
