import { MediaSourceDto } from "@media-source/dtos";
import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

import { Track, TrackAutoplayData } from "../entities";
import { MemberDto } from "./member.dto";

@Exclude()
export class TrackDto {
  @Expose()
  public id!: string;

  @Expose()
  @Type(() => MediaSourceDto)
  public mediaSource!: MediaSourceDto;

  @Expose()
  @Type(() => MemberDto)
  public requestedBy!: MemberDto;

  @Expose()
  public autoplayData!: TrackAutoplayData | null;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  public playedAt!: string | null;

  public static create(entity: Track): TrackDto {
    return plainToInstance(TrackDto, entity);
  }
}
