import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueDestroyedEvent } from "@queue/events";

import { FcmProvider } from "../providers";
import { MessagingRepository } from "../repositories";

@EventsHandler(QueueDestroyedEvent)
export class QueueDestroyedListener implements IEventHandler<QueueDestroyedEvent> {
  constructor(
    private readonly fcmProvider: FcmProvider,
    private readonly messagingRepository: MessagingRepository,
  ) {}

  public async handle(event: QueueDestroyedEvent): Promise<void> {
    const { queue } = event;
    const set = this.messagingRepository.getGroup(queue.voiceChannelId);
    if (!set) return;

    const tokens = Array.from(set);

    await this.fcmProvider.send(tokens, "queue-destroyed", {}, queue.voiceChannelId);

    this.messagingRepository.deleteGroup(queue.voiceChannelId);
  }
}
