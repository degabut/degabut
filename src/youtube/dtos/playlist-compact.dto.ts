import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubePlaylistCompact } from "../entities";
import { YoutubeChannelDto } from "./channel.dto";
import { YoutubeThumbnailDto } from "./thumbnail.dto";

@Exclude()
export class YoutubePlaylistCompactDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  videoCount!: number;

  @Expose()
  @Type(() => YoutubeThumbnailDto)
  thumbnails!: YoutubeThumbnailDto[];

  @Expose()
  @Type(() => YoutubeChannelDto)
  channel!: YoutubeChannelDto;

  public static create(entity: YoutubePlaylistCompact): YoutubePlaylistCompactDto {
    return plainToInstance(YoutubePlaylistCompactDto, entity);
  }
}
