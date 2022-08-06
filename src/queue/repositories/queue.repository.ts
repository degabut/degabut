import { Queue } from "@queue/entities";

export class QueueRepository {
  private readonly queues: Map<string, Queue> = new Map();

  public getByGuildId(guildId: string): Queue | undefined {
    return this.queues.get(guildId);
  }

  public deleteByGuildId(guildId: string): void {
    this.queues.delete(guildId);
  }

  public save(queue: Queue): Queue {
    this.queues.set(queue.guildId, queue);
    return queue;
  }
}
