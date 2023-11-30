import { UserLikeVideo } from "@user/entities";
import { VideoCompactDto } from "@youtube/dtos";
import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

@Exclude()
export class UserLikeVideoDto {
  @Expose()
  userId!: string;

  @Expose()
  videoId!: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  likedAt!: string;

  @Expose()
  @Type(() => VideoCompactDto)
  video?: VideoCompactDto;

  public static create(entity: UserLikeVideo): UserLikeVideoDto {
    return plainToInstance(UserLikeVideoDto, entity);
  }
}
