import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerFiltersChangedEvent } from "@queue-player/events";

import { FcmProvider } from "../providers";
import { MessagingRepository } from "../repositories";

@EventsHandler(PlayerFiltersChangedEvent)
export class PlayerFiltersChangedListener implements IEventHandler<PlayerFiltersChangedEvent> {
  constructor(
    private readonly fcmProvider: FcmProvider,
    private readonly messagingRepository: MessagingRepository,
  ) {}

  public async handle({ player }: PlayerFiltersChangedEvent): Promise<void> {
    const set = this.messagingRepository.getGroup(player.queue.voiceChannelId);
    if (!set) return;

    const tokens = Array.from(set);

    await this.fcmProvider.send(
      tokens,
      "player-filters-changed",
      {
        filters: player.audioPlayer.filters,
      },
      player.queue.voiceChannelId,
    );
  }
}
