import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { JamCollectionDto } from "@queue/dtos";
import { MemberJammedEvent } from "@queue/events";

@EventsHandler(MemberJammedEvent)
export class MemberJammedHandler implements IEventHandler<MemberJammedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ jam, queue }: MemberJammedEvent): Promise<void> {
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, "member-jammed", JamCollectionDto.create(jam));
  }
}
