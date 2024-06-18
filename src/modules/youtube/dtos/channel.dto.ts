import { ImageDto } from "@common/dtos";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { YoutubeChannel } from "../entities";

@Exclude()
export class YoutubeChannelDto {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  @Type(() => ImageDto)
  thumbnails!: ImageDto[];

  public static create(entity: YoutubeChannel): YoutubeChannelDto {
    return plainToInstance(YoutubeChannelDto, entity);
  }
}
