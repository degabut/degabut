import { Exclude, Expose, plainToInstance, Transform } from "class-transformer";
import { GuildMember } from "discord.js";

@Exclude()
export class GuildMemberDto {
  @Expose()
  public id!: string;

  @Expose()
  public displayName!: string;

  @Expose()
  public nickname!: string;

  @Expose()
  @Transform(({ obj }) => obj.user.username)
  public username!: string;

  @Expose()
  @Transform(({ obj }) => obj.user.discriminator)
  public discriminator!: string;

  @Expose()
  @Transform(({ obj }) => obj.user.avatarURL())
  public avatar!: string;

  public static create(entity: GuildMember): GuildMemberDto {
    return plainToInstance(GuildMemberDto, entity);
  }
}
