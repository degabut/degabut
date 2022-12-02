import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GuildMemberDto } from "@queue-player/dtos";
import { TrackSeekedEvent } from "@queue-player/events";

@EventsHandler(TrackSeekedEvent)
export class TrackSeekedHandler implements IEventHandler<TrackSeekedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: TrackSeekedEvent): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { player, position, member } = event;
    const memberIds = player.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, eventName, {
      position,
      member: GuildMemberDto.create(member),
    });
  }
}
