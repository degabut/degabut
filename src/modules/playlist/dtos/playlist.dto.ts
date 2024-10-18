import { ImageDto } from "@common/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { Playlist } from "@playlist/entities";
import { Exclude, Expose, Transform, Type, plainToInstance } from "class-transformer";

@Exclude()
export class PlaylistDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  name!: string;

  @Expose()
  @ApiProperty()
  ownerId!: number;

  @Expose()
  @ApiProperty()
  mediaSourceCount!: number;

  @Expose()
  @Type(() => ImageDto)
  @ApiProperty({ type: [ImageDto] })
  images!: ImageDto[];

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => value?.toISOString() || null)
  createdAt!: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => value?.toISOString() || null)
  updatedAt!: string;

  public static create(entity: Playlist): PlaylistDto {
    return plainToInstance(PlaylistDto, entity);
  }
}
