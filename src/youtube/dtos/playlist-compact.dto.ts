import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { PlaylistCompact } from "../entities";
import { ChannelDto } from "./channel.dto";
import { ThumbnailDto } from "./thumbnail.dto";

@Exclude()
export class PlaylistCompactDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  videoCount!: number;

  @Expose()
  @Type(() => ThumbnailDto)
  thumbnails!: ThumbnailDto[];

  @Expose()
  @Type(() => ChannelDto)
  channel!: ChannelDto;

  public static create(entity: PlaylistCompact): PlaylistCompactDto {
    return plainToInstance(PlaylistCompactDto, entity);
  }
}
