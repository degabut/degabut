import { MediaSourceDto } from "@media-source/dtos";
import { MediaSource } from "@media-source/entities";
import { TrackDto } from "@queue/dtos";
import { Track } from "@queue/entities";
import {
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  EmbedField,
  GuildMember,
  Message,
  VoiceBasedChannel,
} from "discord.js";

import { TimeUtil } from "./time.util";

const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

type VoiceData = { member: GuildMember; voiceChannel: VoiceBasedChannel };

export class DiscordUtil {
  static getVoiceFromInteraction(interaction: CommandInteraction): VoiceData | null {
    if (
      !interaction.member ||
      !("voice" in interaction.member) ||
      !interaction.member.voice.channel ||
      !interaction.guild
    ) {
      return null;
    }

    return {
      member: interaction.member,
      voiceChannel: interaction.member.voice.channel,
    };
  }

  static getVoiceFromMessage(message: Message): VoiceData | null {
    if (!message.member?.voice?.channel || !message.guild) return null;

    return {
      member: message.member,
      voiceChannel: message.member.voice.channel,
    };
  }

  static sourceToMessageButton(
    mediaSource: MediaSource | MediaSourceDto,
    index: number,
  ): ButtonBuilder {
    return new ButtonBuilder({
      customId: `add-track/${mediaSource.type}/${mediaSource.sourceId}`,
      label:
        mediaSource.title.length < 20
          ? mediaSource.title
          : mediaSource.title.substring(0, 20) + "...",
      style: ButtonStyle.Success,
      emoji: numbers[index],
    });
  }

  static sourceToEmbedField(mediaSource: MediaSource | MediaSourceDto, index: number): EmbedField {
    return {
      name: `${numbers[index]} ${mediaSource.title}`,
      value: [
        `**${mediaSource.creator}**`,
        mediaSource.url,
        `Duration: ${mediaSource.duration ? TimeUtil.secondToTime(mediaSource.duration) : "-"}`,
      ].join("\n"),
      inline: false,
    };
  }

  static trackToEmbed(track: Track | TrackDto): EmbedBuilder {
    const fields = [
      {
        name: "Duration",
        value: TimeUtil.secondToTime(track.mediaSource.duration),
        inline: true,
      },
    ];

    if (track.requestedBy) {
      fields.unshift({
        name: "Requested By",
        value: `<@!${track.requestedBy.id}>`,
        inline: true,
      });
    }

    const { title, url, maxThumbnailUrl, youtubeVideo, spotifyTrack } = track.mediaSource;

    if (youtubeVideo?.channel) {
      fields.unshift({
        name: "Channel",
        value: `[${youtubeVideo.channel.name}](https://www.youtube.com/channel/${youtubeVideo.channel.id})`,
        inline: true,
      });
    }

    if (spotifyTrack?.artists) {
      fields.unshift({
        name: "Artists",
        value: spotifyTrack.artists.map((a) => a.name).join(", "),
        inline: true,
      });
    }

    return new EmbedBuilder({
      title,
      url,
      thumbnail: maxThumbnailUrl ? { url: maxThumbnailUrl } : undefined,
      fields,
    });
  }
}
