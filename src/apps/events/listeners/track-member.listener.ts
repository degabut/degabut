import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GuildMemberDto } from "@queue-player/dtos";
import { TrackSkippedEvent } from "@queue-player/events";
import { MemberDto, TrackDto } from "@queue/dtos";
import { Member } from "@queue/entities";
import { TrackAddedEvent, TrackRemovedEvent } from "@queue/events";
import { GuildMember } from "discord.js";

const events = [TrackAddedEvent, TrackRemovedEvent, TrackSkippedEvent];
type Events = InstanceType<(typeof events)[number]>;

@EventsHandler(...events)
export class TrackMemberListener implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { track, member } = event;
    const queue = track.queue;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    let memberDto: MemberDto | GuildMemberDto | null = null;
    if (member instanceof Member) memberDto = MemberDto.create(member);
    else if (member instanceof GuildMember) memberDto = GuildMemberDto.create(member);

    this.gateway.send(memberIds, eventName, {
      track: TrackDto.create(track),
      member: memberDto,
    });
  }
}
