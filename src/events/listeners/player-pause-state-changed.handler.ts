import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerDto } from "@queue-player/dtos";
import { PlayerPauseStateChangedEvent } from "@queue-player/events";

@EventsHandler(PlayerPauseStateChangedEvent)
export class PlayerPauseStateChangedHandler implements IEventHandler<PlayerPauseStateChangedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: PlayerPauseStateChangedEvent): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { player } = event;
    const memberIds = player.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, eventName, QueuePlayerDto.create(player));
  }
}
