import { TextChannel } from "@queue/entities";
import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class TextChannelDto {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  public static create(entity: TextChannel): TextChannelDto {
    return plainToInstance(TextChannelDto, entity);
  }
}
