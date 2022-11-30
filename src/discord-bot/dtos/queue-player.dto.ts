import { QueuePlayer } from "@discord-bot/entities";
import { Exclude, Expose, plainToInstance, Transform } from "class-transformer";

@Exclude()
export class QueuePlayerDto {
  @Expose()
  @Transform(({ obj }) => obj.audioPlayer.position || -1)
  public position!: number;

  @Expose()
  @Transform(({ obj }) => obj.audioPlayer.paused)
  public isPaused!: boolean;

  public static create(entity: QueuePlayer): QueuePlayerDto {
    return plainToInstance(QueuePlayerDto, entity);
  }
}
