import { DiscordUtil } from "@common/utils";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { TrackAddedEvent } from "@queue/events";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
} from "discord.js";

@EventsHandler(TrackAddedEvent)
export class TrackAddedListener implements IEventHandler<TrackAddedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track }: TrackAddedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player) return;

    await player.notify({
      content: `🎵 **Added To Queue** (${track.queue.tracks.length})`,
      embeds: [DiscordUtil.trackToEmbed(track)],
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: [
            new ButtonBuilder({
              customId: `play-track/${track.id}/${track.video.id}}`,
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
  }
}
