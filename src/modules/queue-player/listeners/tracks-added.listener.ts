import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { TracksAddedEvent } from "@queue/events";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TracksAddedEvent)
export class TracksAddedListener implements IEventHandler<TracksAddedEvent> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
  ) {}

  public async handle({ tracks, queue }: TracksAddedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    const requestedBy = tracks[0].requestedBy?.id;
    const length = tracks.length;
    const pluralOrSingular = length === 1 ? "track" : "tracks";

    await this.playerService.notify(player, {
      content: "🎵 **Added To Queue**",
      embeds: [
        new EmbedBuilder({
          description: requestedBy
            ? `**<@!${requestedBy}> added ${length} ${pluralOrSingular} to queue**`
            : `${length} ${pluralOrSingular} added to queue`,
        }),
      ],
    });
  }
}
