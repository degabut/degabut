import { DiscordUtil } from "@common/utils";
import { CommandExceptionFilter } from "@main/filters";
import { CommandResult } from "@main/interfaces";
import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RedirectCommand } from "@queue-player/commands";
import { BaseGuildTextChannel, Message } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";

type HandlerOptions = {
  voiceChannelId: string;
  textChannelId: string;
  userId: string;
};

@Injectable()
export class RedirectDiscordCommand {
  private static readonly commandName = "redirect";
  private static readonly description = "Redirects all notifications messages to this text channel";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: RedirectDiscordCommand.commandName,
    description: RedirectDiscordCommand.description,
  })
  public async prefixHandler(message: Message): Promise<CommandResult> {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData || !(message.channel instanceof BaseGuildTextChannel)) return;

    await this.handler({
      userId: voiceData.member.id,
      textChannelId: message.channel.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });

    await message.reply("All notifications will be sent to this text channel");
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: RedirectDiscordCommand.commandName,
    description: RedirectDiscordCommand.description,
  })
  public async slashHandler(@Context() context: SlashCommandContext) {
    const [interaction] = context;
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData || !(interaction.channel instanceof BaseGuildTextChannel)) return;

    await this.handler({
      userId: voiceData.member.id,
      textChannelId: interaction.channel.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });

    await interaction.reply("All notifications will be sent to this text channel");
  }

  private async handler(options: HandlerOptions) {
    const command = new RedirectCommand({
      voiceChannelId: options.voiceChannelId,
      textChannelId: options.textChannelId,
      executor: { id: options.userId },
    });

    await this.commandBus.execute(command);
  }
}
