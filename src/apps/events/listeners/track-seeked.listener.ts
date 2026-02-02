import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackSeekedEvent } from "@queue-player/events";
import { MemberDto } from "@queue/dtos";

@EventsHandler(TrackSeekedEvent)
export class TrackSeekedListener implements IEventHandler<TrackSeekedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: TrackSeekedEvent): Promise<void> {
    const { player, position, member } = event;
    const memberIds = player.queue.voiceChannel.members.map((m) => m.id);

    this.gateway.send(
      memberIds,
      "track-seeked",
      {
        position,
        member: MemberDto.create(member),
      },
      player.queue.voiceChannelId,
    );
  }
}
