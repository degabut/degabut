import { DiscordUtil } from "@common/utils";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { TracksAddedEvent } from "@queue/events";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
} from "discord.js";

@EventsHandler(TracksAddedEvent)
export class TracksAddedListener implements IEventHandler<TracksAddedEvent> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
  ) {}

  public async handle({ tracks, queue, member }: TracksAddedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    const requestedBy = member?.id;

    if (tracks.length === 1) {
      const track = tracks[0];

      await this.playerService.notify(player, {
        content: `🎵 **Added To Queue** (${track.queue.tracks.length})`,
        embeds: [DiscordUtil.trackToEmbed(track)],
        components: [
          new ActionRowBuilder<MessageActionRowComponentBuilder>({
            components: [
              new ButtonBuilder({
                customId: `play-track/${track.id}/${track.mediaSource.id}`,
                label: "Play",
                style: ButtonStyle.Success,
              }),
              new ButtonBuilder({
                customId: `remove-track/${track.id}`,
                label: "Remove",
                style: ButtonStyle.Danger,
              }),
            ],
          }),
        ],
      });
    } else {
      await this.playerService.notify(player, {
        content: "🎵 **Added To Queue**",
        embeds: [
          new EmbedBuilder({
            description: requestedBy
              ? `**<@!${requestedBy}> added ${tracks.length} tracks to queue**`
              : `**${tracks.length} tracks added to queue**`,
          }),
        ],
      });
    }
  }
}
