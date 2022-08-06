import { PlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackRemovedEvent } from "@queue/events";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackRemovedEvent)
export class TrackRemovedHandler implements IEventHandler<TrackRemovedEvent> {
  constructor(private readonly playerRepository: PlayerRepository) {}

  public async handle({ track, removedBy, isNowPlaying }: TrackRemovedEvent): Promise<void> {
    const player = this.playerRepository.getByGuildId(track.queue.guildId);
    if (!player) return;

    const embed = new EmbedBuilder({
      description: `🚮 **<@!${removedBy}> removed ${track.video.title} from queue**`,
    });

    if (isNowPlaying) player.audioPlayer.stop();

    await player.textChannel.send({
      embeds: [embed],
    });
  }
}
