import { ApiProperty } from "@nestjs/swagger";
import { Guild } from "@queue/entities";
import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class GuildDto {
  @Expose()
  @ApiProperty()
  public id!: string;

  @Expose()
  @ApiProperty()
  public name!: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  public icon!: string | null;

  public static create(entity: Guild): GuildDto {
    return plainToInstance(GuildDto, entity);
  }
}
