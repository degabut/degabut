import { ApiProperty } from "@nestjs/swagger";
import { JamCollection } from "@queue/entities";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { MemberDto } from "./member.dto";

@Exclude()
export class JamDto {
  @Expose()
  @ApiProperty()
  public xOffset!: number;

  @Expose()
  @ApiProperty()
  public jamSpeed!: number;

  @Expose()
  @ApiProperty()
  public ySpeed!: number;
}

@Exclude()
export class JamCollectionDto {
  @Expose()
  @Type(() => JamDto)
  @ApiProperty({ type: [JamDto] })
  public jams!: JamDto[];

  @Expose()
  @Type(() => MemberDto)
  @ApiProperty({ type: MemberDto })
  public member!: MemberDto;

  public static create(entity: JamCollection): JamCollectionDto {
    return plainToInstance(JamCollectionDto, entity);
  }
}
