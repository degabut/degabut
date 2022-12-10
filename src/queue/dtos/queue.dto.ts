import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { LoopMode, Queue } from "../entities";
import { GuildDto } from "./guild.dto";
import { TrackDto } from "./track.dto";
import { VoiceChannelDto } from "./voice-channel.dto";

@Exclude()
export class QueueDto {
  @Expose()
  @Type(() => TrackDto)
  public tracks!: TrackDto[];

  @Expose()
  @Type(() => TrackDto)
  public history!: TrackDto[];

  @Expose()
  public shuffle!: boolean;

  @Expose()
  public loopMode!: LoopMode;

  @Expose()
  @Type(() => TrackDto)
  public nowPlaying!: TrackDto;

  @Expose()
  @Type(() => VoiceChannelDto)
  public voiceChannel!: VoiceChannelDto;

  @Expose()
  @Type(() => GuildDto)
  public guild!: GuildDto;

  public static create(entity: Queue): QueueDto {
    return plainToInstance(QueueDto, entity);
  }
}
