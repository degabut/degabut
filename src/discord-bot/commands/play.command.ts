import { DiscordUtil, YoutubeUtil } from "@common/utils";
import { IPrefixCommand } from "@discord-bot/interfaces";
import { SlashCommandPipe } from "@discord-nestjs/common";
import { Command, Handler, InteractionEvent, Param, ParamType } from "@discord-nestjs/core";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JoinCommand } from "@queue-player/commands";
import { AddTrackCommand } from "@queue/commands";
import {
  BaseGuildTextChannel,
  BaseGuildVoiceChannel,
  CommandInteraction,
  Message,
} from "discord.js";

import { PrefixCommand } from "../decorators";

class PlayDto {
  @Param({ description: "Keyword", required: true, type: ParamType.STRING })
  keyword!: string;
}

type AddTrackOptions = {
  voiceChannel: BaseGuildVoiceChannel;
  userId: string;
  videoId?: string;
  keyword?: string;
};

type JoinOptions = {
  voiceChannel: BaseGuildVoiceChannel;
  textChannel: BaseGuildTextChannel;
  userId: string;
};

@Injectable()
@PrefixCommand({
  name: "play",
  aliases: ["p"],
})
@Command({
  name: "play",
  description: "Play a song by keyword",
})
export class PlayDiscordCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  @Handler()
  async slashHandler(
    @InteractionEvent() interaction: CommandInteraction,
    @InteractionEvent(SlashCommandPipe) options: PlayDto,
  ) {
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData || !(interaction.channel instanceof BaseGuildTextChannel)) return;
    const { keyword } = options;

    await this.handler({
      userId: interaction.user.id,
      voiceChannel: voiceData.voiceChannel,
      textChannel: interaction.channel,
      keyword,
    });

    await interaction.deferReply();
    await interaction.deleteReply();
  }

  public async prefixHandler(message: Message, args: string[]) {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData || !(message.channel instanceof BaseGuildTextChannel)) return;
    const keyword = args.join(" ");

    await this.handler({
      userId: message.author.id,
      voiceChannel: voiceData.voiceChannel,
      textChannel: message.channel,
      keyword,
    });
  }

  private async handler(options: AddTrackOptions & JoinOptions) {
    try {
      await this.addTrack({
        keyword: options.keyword,
        userId: options.userId,
        voiceChannel: options.voiceChannel,
      });
    } catch (err) {
      if (!(err instanceof NotFoundException)) throw err;
      await this.join(options);
      await new Promise((r) => setTimeout(r, 1000));
      await this.addTrack({
        keyword: options.keyword,
        userId: options.userId,
        voiceChannel: options.voiceChannel,
      });
    }
  }

  private async addTrack(options: AddTrackOptions) {
    const videoId = YoutubeUtil.extractYoutubeVideoId(options.keyword || "");

    const adapter = new AddTrackCommand({
      voiceChannelId: options.voiceChannel.id,
      videoId: videoId || undefined,
      keyword: videoId ? undefined : options.keyword,
      executor: { id: options.userId },
    });
    await this.commandBus.execute(adapter);
  }

  private async join(options: JoinOptions) {
    const command = new JoinCommand({
      voiceChannel: options.voiceChannel,
      textChannel: options.textChannel,
      executor: { id: options.userId },
    });

    await this.commandBus.execute(command);
  }
}
