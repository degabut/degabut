import { DiscordUtil } from "@common/utils";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAddedEvent } from "@queue/events";

@EventsHandler(TrackAddedEvent)
export class TrackAddedHandler implements IEventHandler<TrackAddedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track, isPlayedImmediately }: TrackAddedEvent): Promise<void> {
    if (isPlayedImmediately) return;

    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player) return;

    await player.notify({
      content: `🎵 **Added To Queue** (${track.queue.tracks.length})`,
      embeds: [DiscordUtil.trackToEmbed(track)],
    });
  }
}
