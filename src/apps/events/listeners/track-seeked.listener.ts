import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GuildMemberDto } from "@queue-player/dtos";
import { TrackSeekedEvent } from "@queue-player/events";

@EventsHandler(TrackSeekedEvent)
export class TrackSeekedListener implements IEventHandler<TrackSeekedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: TrackSeekedEvent): Promise<void> {
    const { player, position, member } = event;
    const memberIds = player.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, "track-seeked", {
      position,
      member: GuildMemberDto.create(member),
    });
  }
}
