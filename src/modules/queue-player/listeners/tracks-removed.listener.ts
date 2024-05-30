import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { TracksRemovedEvent } from "@queue/events";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TracksRemovedEvent)
export class TracksRemovedListener implements IEventHandler<TracksRemovedEvent> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
  ) {}

  public async handle({ tracks, member, hasNowPlaying }: TracksRemovedEvent): Promise<void> {
    const queue = tracks.at(0)?.queue;
    if (!queue) return;

    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    const embed = new EmbedBuilder({
      description: `🚮 **<@!${member.id}> removed ${tracks.length} tracks from the queue**`,
    });

    if (hasNowPlaying) player.audioPlayer.stop();

    await this.playerService.notify(player, {
      embeds: [embed],
    });
  }
}
