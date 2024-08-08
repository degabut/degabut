import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { MemberJoinedEvent } from "@queue/events";

import { EventsGateway } from "../events.gateway";

@EventsHandler(MemberJoinedEvent)
export class VoiceMemberJoinedListener implements IEventHandler<MemberJoinedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ queue, member }: MemberJoinedEvent): Promise<void> {
    this.gateway.send([member.id], "queue-joined", { voiceChannelId: queue.voiceChannelId });
  }
}
