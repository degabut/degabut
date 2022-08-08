import { VoiceChannel } from "@queue/entities";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { MemberDto } from "./member.dto";

@Exclude()
export class VoiceChannelDto {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  @Type(() => MemberDto)
  public members!: MemberDto[];

  public static create(entity: VoiceChannel): VoiceChannelDto {
    return plainToInstance(VoiceChannelDto, entity);
  }
}
