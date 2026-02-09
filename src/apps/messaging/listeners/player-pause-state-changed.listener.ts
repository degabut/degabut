import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerPauseStateChangedEvent } from "@queue-player/events";

import { FcmProvider } from "../providers";
import { MessagingRepository } from "../repositories";

@EventsHandler(PlayerPauseStateChangedEvent)
export class PlayerPauseStateChangedListener
  implements IEventHandler<PlayerPauseStateChangedEvent>
{
  constructor(
    private readonly fcmProvider: FcmProvider,
    private readonly messagingRepository: MessagingRepository,
  ) {}

  public async handle(event: PlayerPauseStateChangedEvent): Promise<void> {
    const { player } = event;
    const set = this.messagingRepository.getGroup(player.queue.voiceChannelId);
    if (!set) return;

    const tokens = Array.from(set);

    await this.fcmProvider.send(
      tokens,
      "player-pause-state-changed",
      {
        isPaused: player.audioPlayer.isPaused,
      },
      player.queue.voiceChannelId,
    );
  }
}
