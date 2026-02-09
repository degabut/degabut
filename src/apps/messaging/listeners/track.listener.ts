import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAudioStartedEvent } from "@queue-player/events";
import { TrackDto } from "@queue/dtos";
import { QueueProcessedEvent } from "@queue/events";

import { FcmProvider } from "../providers";
import { MessagingRepository } from "../repositories";

const events = [TrackAudioStartedEvent, QueueProcessedEvent];
type Events = InstanceType<(typeof events)[number]>;

@EventsHandler(...events)
export class TrackListener implements IEventHandler<Events> {
  constructor(
    private readonly fcmProvider: FcmProvider,
    private readonly messagingRepository: MessagingRepository,
  ) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const track = event.track;
    const queue = event instanceof QueueProcessedEvent ? event.queue : event.track.queue;
    const set = this.messagingRepository.getGroup(queue.voiceChannelId);
    if (!set) return;

    const tokens = Array.from(set);

    await this.fcmProvider.send(
      tokens,
      eventName,
      track ? TrackDto.create(track) : null,
      queue.voiceChannelId,
    );
  }
}
