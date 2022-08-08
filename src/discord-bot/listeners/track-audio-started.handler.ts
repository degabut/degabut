import { DiscordUtil } from "@common/utils";
import { TrackAudioStartedEvent } from "@discord-bot/events";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

@EventsHandler(TrackAudioStartedEvent)
export class TrackAudioStartedHandler implements IEventHandler<TrackAudioStartedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track }: TrackAudioStartedEvent) {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player) return;

    await player.textChannel.send({
      content: "🎶 **Now Playing**",
      embeds: [DiscordUtil.trackToEmbed(track)],
    });
  }
}
