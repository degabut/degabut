import { QueuePlayer } from "@queue-player/entities";
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

  public static create(entity: QueuePlayer): QueuePlayerDto {
    return plainToInstance(QueuePlayerDto, entity);
  }
}
