import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerFiltersChangedEvent } from "@queue-player/events";

@EventsHandler(PlayerFiltersChangedEvent)
export class PlayerFiltersChangedListener implements IEventHandler<PlayerFiltersChangedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ player }: PlayerFiltersChangedEvent): Promise<void> {
    const memberIds = player.queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(
      memberIds,
      "player-filters-changed",
      {
        filters: player.audioPlayer.filters,
      },
      player.queue.voiceChannelId,
    );
  }
}
