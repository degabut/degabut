import { ApiProperty } from "@nestjs/swagger";
import { TextChannel } from "@queue/entities";
import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class TextChannelDto {
  @Expose()
  @ApiProperty()
  public id!: string;

  @Expose()
  @ApiProperty()
  public name!: string;

  public static create(entity: TextChannel): TextChannelDto {
    return plainToInstance(TextChannelDto, entity);
  }
}
