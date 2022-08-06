import { DiscordUtil } from "@common/utils";
import { PlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackStartedEvent } from "@queue/events";

@EventsHandler(TrackStartedEvent)
export class TrackStartedHandler implements IEventHandler<TrackStartedEvent> {
  constructor(private readonly playerRepository: PlayerRepository) {}

  public async handle({ track }: TrackStartedEvent) {
    const player = this.playerRepository.getByGuildId(track.queue.guildId);
    if (!player) return;

    await player.textChannel.send({
      content: "🎶 **Now Playing**",
      embeds: [DiscordUtil.trackToEmbed(track)],
    });
  }
}
