import { Queue } from "@queue/entities";

export class QueueRepository {
  private readonly queues: Map<string, Queue> = new Map();

  public getByVoiceChannelId(voiceChannelId: string): Queue | undefined {
    return this.queues.get(voiceChannelId);
  }

  public getByGuildId(guildId: string): Queue | undefined {
    return [...this.queues.values()].find((q) => q.guild.id === guildId);
  }

  public getByUserId(userId: string): Queue | undefined {
    return [...this.queues.values()].find((q) => !!q.getMember(userId));
  }

  public deleteByVoiceChannelId(voiceChannelId: string): void {
    this.queues.delete(voiceChannelId);
  }

  public save(queue: Queue): Queue {
    this.queues.set(queue.voiceChannelId, queue);
    return queue;
  }

  public clear(): void {
    this.queues.clear();
  }
}
