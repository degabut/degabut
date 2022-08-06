import { PlayerRepository } from "@discord-bot/repositories";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { BaseGuildVoiceChannel, Client, VoiceChannel } from "discord.js";

export class DiscordBotService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,

    private readonly playerRepository: PlayerRepository,
  ) {}

  public async getGuildMemberId(guildId: string, userId: string): Promise<string> {
    const guild = await this.client.guilds.fetch(guildId);
    const member = await guild?.members.fetch(userId);
    return member.id;
  }

  public async getMemberVoiceChannel(userId: string): Promise<BaseGuildVoiceChannel | null> {
    const player = this.playerRepository.getByUserId(userId);
    return player?.voiceChannel || null;
  }

  public async getVoiceChannelMemberIds(voiceChannelId: string): Promise<string[]> {
    const voiceChannel = await this.client.channels.fetch(voiceChannelId);
    if (!voiceChannel || !(voiceChannel instanceof VoiceChannel)) return [];
    return [...voiceChannel.members.values()].map((m) => m.id);
  }

  public async isMemberInVoiceChannel(voiceChannelId: string, userId: string): Promise<boolean> {
    const voiceChannel = await this.client.channels.fetch(voiceChannelId);
    if (!voiceChannel || !(voiceChannel instanceof VoiceChannel)) return false;
    return voiceChannel.members.has(userId);
  }
}
