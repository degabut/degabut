import { QueuePlayer } from "@discord-bot/entities";

export class QueuePlayerRepository {
  private readonly players: Map<string, QueuePlayer> = new Map();

  public getByGuildId(guildId: string): QueuePlayer | undefined {
    return this.players.get(guildId);
  }

  public getByUserId(userId: string): QueuePlayer | undefined {
    return [...this.players.values()].find((p) => p.hasMember(userId));
  }

  public deleteByGuildId(guildId: string): void {
    this.players.delete(guildId);
  }

  public save(queue: QueuePlayer): QueuePlayer {
    this.players.set(queue.guild.id, queue);
    return queue;
  }
}
