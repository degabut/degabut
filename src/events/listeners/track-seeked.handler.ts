import { GuildMemberDto } from "@discord-bot/dtos";
import { TrackSeekedEvent } from "@discord-bot/events";
import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

@EventsHandler(TrackSeekedEvent)
export class TrackSeekedHandler implements IEventHandler<TrackSeekedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: TrackSeekedEvent): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { player, seek, member } = event;
    const memberIds = player.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, eventName, {
      seek,
      member: GuildMemberDto.create(member),
    });
  }
}
