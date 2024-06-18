import { DiscordUtil } from "@common/utils";
import { CommandResult } from "@discord-bot/interfaces";
import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RemoveTrackCommand } from "@queue/commands";
import { Message } from "discord.js";

import { CommandExceptionFilter } from "@discord-bot/filters";
import { Context, NumberOption, Options, SlashCommand, SlashCommandContext } from "necord";
import { TextCommand } from "../decorators";

class RemoveDto {
  @NumberOption({
    name: "position",
    description: "Track position (remove last track if not provided)",
    required: false,
    min_value: 1,
  })
  position?: number;
}

type HandlerOptions = {
  position?: number;
  voiceChannelId: string;
  userId: string;
};

@Injectable()
export class RemoveDiscordCommand {
  private static readonly commandName = "remove";
  private static readonly description = "Remove a track from queue";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: RemoveDiscordCommand.commandName,
    description: RemoveDiscordCommand.description,
  })
  public async prefixHandler(message: Message, args: string[]): Promise<CommandResult> {
    if (!message.member?.voice.channelId) return;

    const position = +args[0];
    const removed = await this.handler({
      userId: message.author.id,
      voiceChannelId: message.member.voice.channelId,
      position,
    });
    if (!removed) await message.reply("Invalid index!");
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: RemoveDiscordCommand.commandName,
    description: RemoveDiscordCommand.description,
  })
  async slashHandler(@Context() [interaction]: SlashCommandContext, @Options() options: RemoveDto) {
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData) return;

    const position = options.position;

    const removed = await this.handler({
      userId: interaction.user.id,
      voiceChannelId: voiceData.voiceChannel.id,
      position,
    });

    if (!removed) {
      await interaction.reply("Invalid index!");
    } else {
      await interaction.deferReply();
      await interaction.deleteReply();
    }
  }

  private async handler(options: HandlerOptions) {
    const { position, voiceChannelId, userId } = options;

    const command = new RemoveTrackCommand({
      voiceChannelId,
      index: position && !Number.isNaN(position) ? position - 1 : undefined,
      isNowPlaying: !position ? true : undefined,
      executor: { id: userId },
    });

    return await this.commandBus.execute(command);
  }
}
