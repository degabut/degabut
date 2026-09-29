import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { Queue } from "../entities";
import { GuildDto } from "./guild.dto";
import { TextChannelDto } from "./text-channel.dto";
import { TrackDto } from "./track.dto";
import { VoiceChannelDto } from "./voice-channel.dto";

@Exclude()
export class QueueSummaryDto {
  @Expose()
  @Type(() => TrackDto)
  public nowPlaying!: TrackDto;

  @Expose()
  @Type(() => VoiceChannelDto)
  public voiceChannel!: VoiceChannelDto;

  @Expose()
  @Type(() => TextChannelDto)
  public textChannel!: TextChannelDto;

  @Expose()
  @Type(() => GuildDto)
  public guild!: GuildDto;

  public static create(entity: Queue): QueueSummaryDto {
    return plainToInstance(QueueSummaryDto, entity);
  }
}
