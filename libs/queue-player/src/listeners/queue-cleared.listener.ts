import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { QueueClearedEvent } from "@queue/events";
import { EmbedBuilder } from "discord.js";

@EventsHandler(QueueClearedEvent)
export class QueueClearedListener implements IEventHandler<QueueClearedEvent> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
  ) {}

  public async handle({ queue, member, includeNowPlaying }: QueueClearedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    const embed = new EmbedBuilder({
      description: `🚮 **<@!${member.id}> cleared the queue**`,
    });

    if (includeNowPlaying) player.audioPlayer.stop();

    await this.playerService.notify(player, {
      embeds: [embed],
    });
  }
}
