import { JamCollection } from "@queue/entities";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { MemberDto } from "./member.dto";

@Exclude()
export class JamCollectionDto {
  @Expose()
  @Type(() => JamDto)
  public jams!: JamDto[];

  @Expose()
  @Type(() => MemberDto)
  public requestedBy!: MemberDto;

  public static create(entity: JamCollection): JamCollectionDto {
    return plainToInstance(JamCollectionDto, entity);
  }
}

@Exclude()
export class JamDto {
  @Expose()
  public xOffset!: number;

  @Expose()
  public jamSpeed!: number;

  @Expose()
  public ySpeed!: number;
}
