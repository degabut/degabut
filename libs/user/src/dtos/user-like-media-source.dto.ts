import { MediaSourceDto } from "@media-source/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { UserLikeMediaSource } from "@user/entities";
import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

@Exclude()
export class UserLikeMediaSourceDto {
  @Expose()
  @ApiProperty()
  userId!: string;

  @Expose()
  @ApiProperty()
  mediaSourceId!: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  @ApiProperty()
  likedAt!: string;

  @Expose()
  @Type(() => MediaSourceDto)
  @ApiProperty({ type: MediaSourceDto })
  mediaSource?: MediaSourceDto;

  public static create(entity: UserLikeMediaSource): UserLikeMediaSourceDto {
    return plainToInstance(UserLikeMediaSourceDto, entity);
  }
}
