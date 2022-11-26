import { Transcript } from "@youtube/entities";
import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class TranscriptDto {
  @Expose()
  start!: number;

  @Expose()
  end!: number;

  @Expose()
  duration!: number;

  @Expose()
  text!: string;

  public static create(entity: Transcript): TranscriptDto {
    return plainToInstance(TranscriptDto, entity);
  }
}
