import { ImageDto } from "@common/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubePlaylistCompact } from "../entities";
import { YoutubeChannelDto } from "./channel.dto";

@Exclude()
export class YoutubePlaylistCompactDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  title!: string;

  @Expose()
  @ApiProperty()
  videoCount!: number;

  @Expose()
  @Type(() => ImageDto)
  @ApiProperty({ type: [ImageDto] })
  thumbnails!: ImageDto[];

  @Expose()
  @Type(() => YoutubeChannelDto)
  @ApiProperty({ type: YoutubeChannelDto })
  channel!: YoutubeChannelDto;

  public static create(entity: YoutubePlaylistCompact): YoutubePlaylistCompactDto {
    return plainToInstance(YoutubePlaylistCompactDto, entity);
  }
}
