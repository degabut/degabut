import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { MemberLeftEvent } from "@queue/events";

import { EventsGateway } from "../events.gateway";

@EventsHandler(MemberLeftEvent)
export class VoiceMemberLeftListener implements IEventHandler<MemberLeftEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ member, queue }: MemberLeftEvent): Promise<void> {
    this.gateway.send([member.id], "queue-left", { voiceChannelId: queue.voiceChannelId });
  }
}
