import { TrackSkippedEvent } from "@discord-bot/events";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackSkippedEvent)
export class TrackSkippedHandler implements IEventHandler<TrackSkippedEvent> {
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
