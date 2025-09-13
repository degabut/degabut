import { DiscordUtil } from "@common/utils";
import { DiscordBotService } from "@main/discord-bot.service";
import { CommandExceptionFilter } from "@main/filters";
import { Injectable, UseFilters } from "@nestjs/common";
import { BaseGuildTextChannel, BaseGuildVoiceChannel, Message } from "discord.js";
import { Context, Options, SlashCommand, SlashCommandContext, StringOption } from "necord";

import { TextCommand } from "../decorators";

class PlayDto {
  @StringOption({ name: "keyword", description: "Search keyword", required: true, min_length: 1 })
  keyword!: string;
}

type AddTrackOptions = {
  voiceChannel: BaseGuildVoiceChannel;
  userId: string;
  keyword: string;
};

type JoinOptions = {
  voiceChannel: BaseGuildVoiceChannel;
  textChannel: BaseGuildTextChannel;
  userId: string;
};

@Injectable()
export class PlayDiscordCommand {
  private static readonly commandName = "play";
  private static readonly description = "Add a song to queue by keyword";

  constructor(private readonly service: DiscordBotService) {}

  @TextCommand({
    name: PlayDiscordCommand.commandName,
    aliases: ["p"],
    description: PlayDiscordCommand.description,
  })
  public async prefixHandler(message: Message, args: string[]) {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData || !(message.channel instanceof BaseGuildTextChannel)) return;
    const keyword = args.join(" ");

    await this.service.joinAndAddTrack({
      userId: message.author.id,
      voiceChannel: voiceData.voiceChannel,
      textChannel: message.channel,
      keyword,
    });
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: PlayDiscordCommand.commandName,
    description: PlayDiscordCommand.description,
  })
  async slashHandler(@Context() context: SlashCommandContext, @Options() options: PlayDto) {
    const [interaction] = context;
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData || !(interaction.channel instanceof BaseGuildTextChannel)) return;
    const { keyword } = options;

    await this.service.joinAndAddTrack({
      userId: interaction.user.id,
      voiceChannel: voiceData.voiceChannel,
      textChannel: interaction.channel,
      keyword,
    });

    await interaction.deferReply();
    await interaction.deleteReply();
  }
}
