import { TrackAudioSkippedEvent } from "@discord-bot/events";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackAudioSkippedEvent)
export class TrackAudioSkippedHandler implements IEventHandler<TrackAudioSkippedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track, skippedBy }: TrackAudioSkippedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player) return;

    const embed = new EmbedBuilder({
      description: `⏭ **<@!${skippedBy.id}> skipped ${track.video.title}**`,
    });
    await player.textChannel.send({
      embeds: [embed],
    });
  }
}
