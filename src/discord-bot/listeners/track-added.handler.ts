import { DiscordUtil } from "@common/utils";
import { PlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAddedEvent } from "@queue/events";

@EventsHandler(TrackAddedEvent)
export class TrackAddedHandler implements IEventHandler<TrackAddedEvent> {
  constructor(private readonly playerRepository: PlayerRepository) {}

  public async handle({ track, isPlayedImmediately }: TrackAddedEvent): Promise<void> {
    if (isPlayedImmediately) return;

    const player = this.playerRepository.getByGuildId(track.queue.guildId);
    if (!player) return;

    await player.textChannel.send({
      content: `🎵 **Added To Queue** (${track.queue.tracks.length})`,
      embeds: [DiscordUtil.trackToEmbed(track)],
    });
  }
}
