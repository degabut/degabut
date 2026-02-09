import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue-player/events";
import { MemberDto, TrackDto } from "@queue/dtos";

import { FcmProvider } from "../providers";
import { MessagingRepository } from "../repositories";

@EventsHandler(TrackSkippedEvent)
export class TrackSkippedListener implements IEventHandler<TrackSkippedEvent> {
  constructor(
    private readonly fcmProvider: FcmProvider,
    private readonly messagingRepository: MessagingRepository,
  ) {}

  public async handle(event: TrackSkippedEvent): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { track, member } = event;
    const queue = track.queue;
    const set = this.messagingRepository.getGroup(queue.voiceChannelId);
    if (!set) return;

    const tokens = Array.from(set);
    const memberDto = member ? MemberDto.create(member) : null;

    await this.fcmProvider.send(
      tokens,
      eventName,
      {
        track: TrackDto.create(track),
        member: memberDto,
      },
      queue.voiceChannelId,
    );
  }
}
