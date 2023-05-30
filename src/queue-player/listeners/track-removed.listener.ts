import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { TrackRemovedEvent } from "@queue/events";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackRemovedEvent)
export class TrackRemovedListener implements IEventHandler<TrackRemovedEvent> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
  ) {}

  public async handle({ track, member, isNowPlaying }: TrackRemovedEvent): Promise<void> {
    if (!member) return; // removed from queue being processed

    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player) return;

    const embed = new EmbedBuilder({
      description: `🚮 **<@!${member.id}> removed ${track.video.title} from queue**`,
    });

    if (isNowPlaying) player.audioPlayer.stop();

    await this.playerService.notify(player, {
      embeds: [embed],
    });
  }
}
