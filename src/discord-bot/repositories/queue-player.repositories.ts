import { QueuePlayer } from "@discord-bot/entities";

export class QueuePlayerRepository {
  private readonly players: Map<string, QueuePlayer> = new Map();

  public getByVoiceChannelId(voiceChannelId: string): QueuePlayer | undefined {
    return this.players.get(voiceChannelId);
  }

  public getByGuildId(guildId: string): QueuePlayer | undefined {
    return [...this.players.values()].find((p) => p.guild.id === guildId);
  }

  public getByUserId(userId: string): QueuePlayer | undefined {
    return [...this.players.values()].find((p) => !!p.getMember(userId));
  }

  public deleteByVoiceChannelId(voiceChannelId: string): void {
    this.players.delete(voiceChannelId);
  }

  public save(player: QueuePlayer): QueuePlayer {
    this.players.set(player.voiceChannel.id, player);
    return player;
  }
}
