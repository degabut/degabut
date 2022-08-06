import { GuildMemberDto } from "@discord/dtos";
import { VideoCompactDto } from "@youtube/dtos";
import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

import { Track } from "../entities/Track";

@Exclude()
export class TrackDto {
  @Expose()
  public id!: string;

  @Expose()
  public url!: string;

  @Expose()
  @Type(() => VideoCompactDto)
  public video!: VideoCompactDto;

  @Expose()
  @Type(() => GuildMemberDto)
  public requestedBy!: GuildMemberDto;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  public playedAt!: string | null;

  public static create(entity: Track): TrackDto {
    return plainToInstance(TrackDto, entity);
  }
}
