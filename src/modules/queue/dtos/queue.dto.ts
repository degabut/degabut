import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { LoopMode, Queue } from "../entities";
import { GuildDto } from "./guild.dto";
import { TextChannelDto } from "./text-channel.dto";
import { TrackDto } from "./track.dto";
import { VoiceChannelDto } from "./voice-channel.dto";

@Exclude()
export class QueueDto {
  @Expose()
  @Type(() => TrackDto)
  @ApiProperty({ type: [TrackDto] })
  public tracks!: TrackDto[];

  @Expose()
  @Type(() => TrackDto)
  @ApiProperty({ type: [TrackDto] })
  public history!: TrackDto[];

  @Expose()
  @ApiProperty()
  public shuffle!: boolean;

  @Expose()
  @ApiProperty({ enum: LoopMode })
  public loopMode!: LoopMode;

  @Expose()
  @Type(() => TrackDto)
  @ApiProperty({ type: TrackDto, nullable: true })
  public nowPlaying!: TrackDto | null;

  @Expose()
  @ApiProperty({ type: [String] })
  public nextTrackIds!: string[];

  @Expose()
  @Type(() => VoiceChannelDto)
  @ApiProperty({ type: VoiceChannelDto })
  public voiceChannel!: VoiceChannelDto;

  @Expose()
  @Type(() => TextChannelDto)
  @ApiProperty({ type: TextChannelDto, nullable: true })
  public textChannel!: TextChannelDto | null;

  @Expose()
  @Type(() => GuildDto)
  @ApiProperty({ type: GuildDto })
  public guild!: GuildDto;

  public static create(entity: Queue): QueueDto {
    return plainToInstance(QueueDto, entity);
  }
}
