import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";
import * as dayjs from "dayjs";

@Exclude()
export class UserMonthlyPlayActivityDto {
  @Expose()
  @Transform(({ value }) => dayjs(value).format("YYYY-MM-DD"))
  public date!: Date;

  @Expose()
  @Type(() => Number)
  public playCount!: number;

  @Expose()
  @Type(() => Number)
  public uniquePlayCount!: number;

  public static create(data: unknown): UserMonthlyPlayActivityDto {
    return plainToInstance(UserMonthlyPlayActivityDto, data);
  }
}
