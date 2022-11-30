import { QueuePlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue/events";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackSkippedEvent)
export class TrackSkippedHandler implements IEventHandler<TrackSkippedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track, member }: TrackSkippedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player || (!player.audioPlayer.playing && !player.audioPlayer.paused)) return;

    player.audioPlayer.stop();

    const embed = new EmbedBuilder({
      description: `⏭ **<@!${member.id}> skipped ${track.video.title}**`,
    });

    await player.notify({
      embeds: [embed],
    });
  }
}
