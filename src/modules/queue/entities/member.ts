import { GuildMember } from "discord.js";

/** Construction input; the ping timestamp defaults to now and need not be supplied. */
type ConstructorProps = Omit<Member, "lastPingTimestamp" | "isActive">;

export class Member {
  public id!: string;
  public displayName!: string;
  public nickname!: string | null;
  public username!: string;
  public discriminator!: string;
  public avatar!: string | null;
  public isInVoiceChannel!: boolean;
  public isLink!: boolean;
  public lastPingTimestamp!: number;

  constructor(params: ConstructorProps) {
    Object.assign(this, params);
    this.lastPingTimestamp = Date.now();
  }

  static fromDiscordGuildMember(
    member: GuildMember,
    isInVoiceChannel: boolean,
    isLink: boolean,
  ): Member {
    return new Member({
      id: member.id,
      username: member.user.username,
      nickname: member.nickname,
      displayName: member.displayName,
      discriminator: member.user.discriminator,
      avatar: member.displayAvatarURL(),
      isInVoiceChannel,
      isLink,
    });
  }

  get isActive(): boolean {
    // 2 minutes timeout for link members
    return (
      this.isInVoiceChannel || (this.isLink && Date.now() - this.lastPingTimestamp < 120 * 1000)
    );
  }
}
