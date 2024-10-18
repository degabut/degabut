import { MediaSourceDto } from "@media-source/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { PlaylistMediaSource } from "@playlist/entities";
import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

@Exclude()
export class PlaylistMediaSourceDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  playlistId!: string;

  @Expose()
  @ApiProperty()
  mediaSourceId!: number;

  @Expose()
  @ApiProperty()
  createdBy!: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  @ApiProperty()
  createdAt!: string;

  @Expose()
  @Type(() => MediaSourceDto)
  @ApiProperty({ type: MediaSourceDto })
  mediaSource?: MediaSourceDto;

  public static create(entity: PlaylistMediaSource): PlaylistMediaSourceDto {
    return plainToInstance(PlaylistMediaSourceDto, entity);
  }
}
