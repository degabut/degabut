import { QueuePlayer } from "@queue-player/entities";
import { PlayerFilters } from "@queue-player/providers";
import { Exclude, Expose, plainToInstance, Transform } from "class-transformer";

@Exclude()
export class QueuePlayerDto {
  @Expose()
  @Transform(({ obj }: { obj: QueuePlayer }) => obj.audioPlayer.position || -1)
  public position!: number;

  @Expose()
  @Transform(({ obj }: { obj: QueuePlayer }) => obj.audioPlayer.isPaused)
  public isPaused!: boolean;

  @Expose()
  @Transform(({ obj }: { obj: QueuePlayer }) => obj.audioPlayer.isSeekable)
  public isSeekable!: boolean;

  @Expose()
  @Transform(({ obj }: { obj: QueuePlayer }) => obj.audioPlayer.filters)
  public filters!: PlayerFilters;

  @Expose()
  @Transform(({ obj }: { obj: QueuePlayer }) => obj.audioPlayer.plugins)
  public plugins!: string[];

  @Expose()
  @Transform(({ obj }: { obj: QueuePlayer }) => obj.audioPlayer.type)
  public type!: string;

  @Expose()
  public streamToken!: string;

  public static create(entity: QueuePlayer, userId: string): QueuePlayerDto {
    const dto = plainToInstance(QueuePlayerDto, entity);
    dto.streamToken = entity.issueStreamToken(userId);
    return dto;
  }
}
