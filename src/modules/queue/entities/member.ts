import { GuildMember } from "discord.js";

export class Member {
  public id!: string;
  public displayName!: string;
  public nickname!: string | null;
  public username!: string;
  public discriminator!: string;
  public avatar!: string | null;
  public isInVoiceChannel!: boolean;

  constructor(params: Member) {
    Object.assign(this, params);
  }

  static fromDiscordGuildMember(member: GuildMember, isInVoiceChannel: boolean): Member {
    return new Member({
      id: member.id,
      username: member.user.username,
      nickname: member.nickname,
      displayName: member.displayName,
      discriminator: member.user.discriminator,
      avatar: member.displayAvatarURL(),
      isInVoiceChannel,
    });
  }
}
