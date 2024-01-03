import { MediaSourceDto } from "@media-source/dtos";
import { PlaylistMediaSource } from "@playlist/entities";
import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

@Exclude()
export class PlaylistMediaSourceDto {
  @Expose()
  id!: string;

  @Expose()
  playlistId!: string;

  @Expose()
  mediaSourceId!: number;

  @Expose()
  createdBy!: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  createdAt!: string;

  @Expose()
  @Type(() => MediaSourceDto)
  mediaSource?: MediaSourceDto;

  public static create(entity: PlaylistMediaSource): PlaylistMediaSourceDto {
    return plainToInstance(PlaylistMediaSourceDto, entity);
  }
}
