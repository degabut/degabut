import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerPauseStateChangedEvent } from "@queue-player/events";

@EventsHandler(PlayerPauseStateChangedEvent)
export class PlayerPauseStateChangedListener
  implements IEventHandler<PlayerPauseStateChangedEvent>
{
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: PlayerPauseStateChangedEvent): Promise<void> {
    const { player } = event;
    const memberIds = player.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, "player-pause-state-changed", {
      isPaused: player.audioPlayer.paused,
    });
  }
}
