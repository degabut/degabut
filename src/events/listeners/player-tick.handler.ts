import { QueuePlayerDto } from "@discord-bot/dtos";
import { PlayerTickEvent } from "@discord-bot/events";
import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

@EventsHandler(PlayerTickEvent)
export class PlayerTickHandler implements IEventHandler<PlayerTickEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ player }: PlayerTickEvent): Promise<void> {
    const memberIds = player.voiceChannel.members.map((m) => m.id);
    this.gateway.send(memberIds, "player-tick", QueuePlayerDto.create(player));
  }
}
