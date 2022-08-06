import { PlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue/events";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackSkippedEvent)
export class TrackSkippedHandler implements IEventHandler<TrackSkippedEvent> {
  constructor(private readonly playerRepository: PlayerRepository) {}

  public async handle({ track, skippedBy }: TrackSkippedEvent): Promise<void> {
    const player = this.playerRepository.getByGuildId(track.queue.guildId);
    if (!player) return;

    const embed = new EmbedBuilder({
      description: `⏭ **<@!${skippedBy}> skipped ${track.video.title}**`,
    });
    await player.textChannel.send({
      embeds: [embed],
    });
  }
}
