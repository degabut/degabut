import { ImageDto } from "@common/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubeChannel } from "../entities";

@Exclude()
export class YoutubeChannelDto {
  @Expose()
  @ApiProperty()
  public id!: string;

  @Expose()
  @ApiProperty()
  public name!: string;

  @Expose()
  @Type(() => ImageDto)
  @ApiProperty({ type: [ImageDto] })
  thumbnails!: ImageDto[];

  public static create(entity: YoutubeChannel): YoutubeChannelDto {
    return plainToInstance(YoutubeChannelDto, entity);
  }
}
