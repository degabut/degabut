import { MediaSourceDto } from "@media-source/dtos";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

@Exclude()
export class UserMostPlayedDto {
  @Expose()
  mediaSourceId!: string;

  @Expose()
  @Type(() => Number)
  count!: number;

  @Expose()
  @Type(() => MediaSourceDto)
  mediaSource!: MediaSourceDto;

  public static create(data: unknown): UserMostPlayedDto {
    return plainToInstance(UserMostPlayedDto, data);
  }
}
