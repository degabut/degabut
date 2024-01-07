import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { JamCollectionDto } from "@queue/dtos";
import { MemberJammedEvent } from "@queue/events";

@EventsHandler(MemberJammedEvent)
export class MemberJammedListener implements IEventHandler<MemberJammedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ jam, queue }: MemberJammedEvent): Promise<void> {
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "member-jammed", JamCollectionDto.create(jam));
  }
}
