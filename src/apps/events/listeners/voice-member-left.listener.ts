import { EventsGateway } from "@events/events.gateway";
import { VoiceMemberLeftEvent } from "@main/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

@EventsHandler(VoiceMemberLeftEvent)
export class VoiceMemberLeftListener implements IEventHandler<VoiceMemberLeftEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ voiceChannel, member }: VoiceMemberLeftEvent): Promise<void> {
    this.gateway.send(
      [member.id],
      "queue-left",
      { voiceChannelId: voiceChannel.id },
      voiceChannel.id,
    );
  }
}
