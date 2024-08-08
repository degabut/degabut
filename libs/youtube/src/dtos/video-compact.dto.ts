import { ImageDto } from "@common/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubeVideoCompact } from "../entities";
import { YoutubeChannelDto } from "./channel.dto";

@Exclude()
export class YoutubeVideoCompactDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  title!: string;

  @Expose()
  @ApiProperty()
  duration!: number;

  @Expose()
  @Type(() => ImageDto)
  @ApiProperty({ type: [ImageDto] })
  thumbnails!: ImageDto[];

  @Expose()
  @ApiProperty()
  viewCount!: number;

  @Expose()
  @Type(() => YoutubeChannelDto)
  @ApiProperty({ type: YoutubeChannelDto })
  channel!: YoutubeChannelDto;

  public static create(entity: YoutubeVideoCompact): YoutubeVideoCompactDto {
    return plainToInstance(YoutubeVideoCompactDto, entity);
  }
}
