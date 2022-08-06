import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { Channel } from "../entities";
import { ThumbnailDto } from "./thumbnail.dto";

@Exclude()
export class ChannelDto {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  @Type(() => ThumbnailDto)
  thumbnails!: ThumbnailDto[];

  public static create(entity: Channel): ChannelDto {
    return plainToInstance(ChannelDto, entity);
  }
}
