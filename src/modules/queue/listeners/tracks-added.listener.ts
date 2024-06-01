import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TracksAddedEvent } from "@queue/events";
import { QueueService } from "@queue/services";

@EventsHandler(TracksAddedEvent)
export class TracksAddedListener implements IEventHandler<TracksAddedEvent> {
  constructor(private readonly queueService: QueueService) {}

  public async handle({ queue }: TracksAddedEvent): Promise<void> {
    if (!queue.nowPlaying) this.queueService.processQueue(queue);
  }
}
