import { PlaylistVideo } from "@playlist/entities";
import { VideoCompactDto } from "@youtube/dtos";
import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

@Exclude()
export class PlaylistVideoDto {
  @Expose()
  id!: string;

  @Expose()
  playlistId!: string;

  @Expose()
  videoId!: number;

  @Expose()
  createdBy!: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  createdAt!: string;

  @Expose()
  @Type(() => VideoCompactDto)
  video?: VideoCompactDto;

  public static create(entity: PlaylistVideo): PlaylistVideoDto {
    return plainToInstance(PlaylistVideoDto, entity);
  }
}
