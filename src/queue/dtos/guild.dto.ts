import { Guild } from "@queue/entities";
import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class GuildDto {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public icon!: string | null;

  public static create(entity: Guild): GuildDto {
    return plainToInstance(GuildDto, entity);
  }
}
