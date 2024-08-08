import { ApiProperty } from "@nestjs/swagger";
import { VoiceChannel } from "@queue/entities";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { MemberDto } from "./member.dto";

@Exclude()
export class VoiceChannelDto {
  @Expose()
  @ApiProperty()
  public id!: string;

  @Expose()
  @ApiProperty()
  public name!: string;

  @Expose()
  @Type(() => MemberDto)
  @ApiProperty({ type: [MemberDto] })
  public members!: MemberDto[];

  public static create(entity: VoiceChannel): VoiceChannelDto {
    return plainToInstance(VoiceChannelDto, entity);
  }
}
