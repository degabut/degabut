import { QueuePlayerDto } from "@discord-bot/dtos";
import { PlayerPauseStateChangedEvent } from "@discord-bot/events";
import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

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
