import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackSeekedEvent } from "@queue-player/events";
import { MemberDto } from "@queue/dtos";

import { FcmProvider } from "../providers";
import { MessagingRepository } from "../repositories";

@EventsHandler(TrackSeekedEvent)
export class TrackSeekedListener implements IEventHandler<TrackSeekedEvent> {
  constructor(
    private readonly fcmProvider: FcmProvider,
    private readonly messagingRepository: MessagingRepository,
  ) {}

  public async handle(event: TrackSeekedEvent): Promise<void> {
    const { player, position, member } = event;
    const set = this.messagingRepository.getGroup(player.queue.voiceChannelId);
    if (!set) return;

    const tokens = Array.from(set);

    this.fcmProvider.send(
      tokens,
      "track-seeked",
      {
        position,
        member: MemberDto.create(member),
      },
      player.queue.voiceChannelId,
    );
  }
}
