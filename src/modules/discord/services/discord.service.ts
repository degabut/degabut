import { Injectable } from "@nestjs/common";
import { BaseGuildVoiceChannel, Client, GuildMember, PermissionFlagsBits } from "discord.js";

@Injectable()
export class DiscordService {
  constructor(private readonly client: Client) {}

  async getMemberWithPermissionIn(
    userId: string,
    voiceChannelId: string,
  ): Promise<GuildMember | null> {
    const channel = await this.client.channels.fetch(voiceChannelId);
    if (!channel || !(channel instanceof BaseGuildVoiceChannel)) {
      return null;
    }

    const guild = channel.guild;
    const member = await guild.members.fetch(userId);
    const hasPermission = member.permissionsIn(voiceChannelId).has(PermissionFlagsBits.Connect);
    return hasPermission ? member : null;
  }
}
