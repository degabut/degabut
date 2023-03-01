import { TrackDto } from "@queue/dtos";
import { Track } from "@queue/entities";
import { Video, VideoCompact } from "@youtube/entities";
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

  static videoToMessageButton(
    video: Omit<Video | VideoCompact, "updatedAt">,
    index: number,
  ): ButtonBuilder {
    return new ButtonBuilder({
      customId: `add-track/${video.id}`,
      label: video.title.length < 20 ? video.title : video.title.substring(0, 20) + "...",
      style: ButtonStyle.Success,
      emoji: numbers[index],
    });
  }

  static videoToEmbedField(
    video: Omit<Video | VideoCompact, "updatedAt">,
    index: number,
  ): EmbedField {
    return {
      name: `${numbers[index]} ${video.title}`,
      value: [
        `**${video.channel?.name}**`,
        `https://youtu.be/${video.id}`,
        `Duration: ${video.duration ? TimeUtil.secondToTime(video.duration) : "-"}`,
      ].join("\n"),
      inline: false,
    };
  }

  static trackToEmbed(track: Track | TrackDto): EmbedBuilder {
    const fields = [
      {
        name: "Duration",
        value: TimeUtil.secondToTime(track.video.duration),
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

    if (track.video.channel) {
      fields.unshift({
        name: "Channel",
        value: `[${track.video.channel.name}](https://www.youtube.com/channel/${track.video.channel.id})`,
        inline: true,
      });
    }

    const thumbnail = track.video.thumbnails.at(-1);

    return new EmbedBuilder({
      title: track.video.title,
      url: track.url,
      thumbnail: thumbnail ? { url: thumbnail.url } : undefined,
      fields,
    });
  }
}
