import { MediaSourceDto } from "@media-source/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

import { Track } from "../entities";
import { MemberDto } from "./member.dto";

@Exclude()
export class TrackDto {
  @Expose()
  @ApiProperty()
  public id!: string;

  @Expose()
  @Type(() => MediaSourceDto)
  @ApiProperty({ type: MediaSourceDto })
  public mediaSource!: MediaSourceDto;

  @Expose()
  @Type(() => MemberDto)
  @ApiProperty({ type: MemberDto })
  public requestedBy!: MemberDto;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  @ApiProperty({ type: String, nullable: true })
  public playedAt!: string | null;

  public static create(entity: Track): TrackDto {
    return plainToInstance(TrackDto, entity);
  }
}
