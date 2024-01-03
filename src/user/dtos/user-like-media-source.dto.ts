import { MediaSourceDto } from "@media-source/dtos";
import { UserLikeMediaSource } from "@user/entities";
import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

@Exclude()
export class UserLikeMediaSourceDto {
  @Expose()
  userId!: string;

  @Expose()
  mediaSourceId!: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  likedAt!: string;

  @Expose()
  @Type(() => MediaSourceDto)
  mediaSource?: MediaSourceDto;

  public static create(entity: UserLikeMediaSource): UserLikeMediaSourceDto {
    return plainToInstance(UserLikeMediaSourceDto, entity);
  }
}
