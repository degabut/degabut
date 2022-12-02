import { VoiceMemberJoinedEvent } from "@discord-bot/events";
import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

@EventsHandler(VoiceMemberJoinedEvent)
export class VoiceMemberJoinedListener implements IEventHandler<VoiceMemberJoinedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ voiceChannel, member }: VoiceMemberJoinedEvent): Promise<void> {
    this.gateway.send([member.id], "queue-joined", { voiceChannelId: voiceChannel.id });
  }
}
