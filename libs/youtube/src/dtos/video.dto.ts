import { ImageDto } from "@common/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubeVideo } from "../entities";
import { YoutubeChannelDto } from "./channel.dto";
import { YoutubeVideoCompactDto } from "./video-compact.dto";

@Exclude()
export class YoutubeVideoDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  title!: string;

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  duration!: number | null;

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

  @Expose()
  @Type(() => YoutubeVideoCompactDto)
  @ApiProperty({ type: [YoutubeVideoCompactDto] })
  related!: YoutubeVideoCompactDto[];

  public static create(entity: YoutubeVideo): YoutubeVideoDto {
    return plainToInstance(YoutubeVideoDto, entity);
  }
}
