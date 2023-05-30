import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue-player/events";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackSkippedEvent)
export class TrackSkippedListener implements IEventHandler<TrackSkippedEvent> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
  ) {}

  public async handle({ track, member }: TrackSkippedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player) return;

    const embed = new EmbedBuilder({
      description: `⏭ **<@!${member.id}> skipped ${track.video.title}**`,
    });

    await this.playerService.notify(player, {
      embeds: [embed],
    });
  }
}
