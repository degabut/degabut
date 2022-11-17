import { QueuePlayerRepository } from "@discord-bot/repositories";
import { AudioPlayerStatus } from "@discordjs/voice";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackMarkedPlayNextEvent } from "@queue/events";

@EventsHandler(TrackMarkedPlayNextEvent)
export class TrackMarkedPlayNextHandler implements IEventHandler<TrackMarkedPlayNextEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track }: TrackMarkedPlayNextEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player || player.audioPlayer.state.status !== AudioPlayerStatus.Playing) return;

    player.audioPlayer.stop();
  }
}
