import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueAutoplayToggledEvent } from "@queue/events";

@EventsHandler(QueueAutoplayToggledEvent)
export class QueueAutoplayToggledListener implements IEventHandler<QueueAutoplayToggledEvent> {
  public async handle({ queue }: QueueAutoplayToggledEvent): Promise<void> {
    if (queue.autoplay && !queue.nowPlaying) {
      queue.processQueue();
    }
  }
}
