import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue-player/events";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackSkippedEvent)
export class TrackSkippedListener implements IEventHandler<TrackSkippedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track, member }: TrackSkippedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player) return;

    const embed = new EmbedBuilder({
      description: `⏭ **<@!${member.id}> skipped ${track.video.title}**`,
    });

    await player.notify({
      embeds: [embed],
    });
  }
}
