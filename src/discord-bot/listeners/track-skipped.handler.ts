import { QueuePlayerRepository } from "@discord-bot/repositories";
import { AudioPlayerStatus } from "@discordjs/voice";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue/events";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackSkippedEvent)
export class TrackSkippedHandler implements IEventHandler<TrackSkippedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track, executor }: TrackSkippedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player || player.audioPlayer.state.status !== AudioPlayerStatus.Playing) return;

    player.audioPlayer.stop();

    const embed = new EmbedBuilder({
      description: `⏭ **<@!${executor.id}> skipped ${track.video.title}**`,
    });
    await player.textChannel.send({
      embeds: [embed],
    });
  }
}
