import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { MixPlaylist } from "youtubei";

import { VideoCompactDto } from "./video-compact.dto";

@Exclude()
export class MixPlaylistDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  videoCount!: number;

  @Expose()
  @Type(() => VideoCompactDto)
  videos!: VideoCompactDto[];

  public static create(entity: MixPlaylist): MixPlaylistDto {
    return plainToInstance(MixPlaylistDto, entity);
  }
}
