import { VideoCompactDto } from "@youtube/dtos";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

@Exclude()
export class UserMostPlayedDto {
  @Expose()
  videoId!: string;

  @Expose()
  @Type(() => Number)
  count!: number;

  @Expose()
  @Type(() => VideoCompactDto)
  video!: VideoCompactDto;

  public static create(data: unknown): UserMostPlayedDto {
    return plainToInstance(UserMostPlayedDto, data);
  }
}
