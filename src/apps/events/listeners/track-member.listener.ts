import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue-player/events";
import { MemberDto, TrackDto } from "@queue/dtos";
import { NextTrackAddedEvent, NextTrackRemovedEvent } from "@queue/events";

const events = [TrackSkippedEvent, NextTrackAddedEvent, NextTrackRemovedEvent];
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
    const memberDto = member ? MemberDto.create(member) : null;

    this.gateway.send(
      memberIds,
      eventName,
      {
        track: TrackDto.create(track),
        member: memberDto,
      },
      queue.voiceChannelId,
    );
  }
}
