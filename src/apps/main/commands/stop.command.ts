import { DiscordUtil } from "@common/utils";
import { CommandExceptionFilter } from "@main/filters";
import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { StopCommand } from "@queue-player/commands";
import { Message } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";

type HandlerOptions = {
  voiceChannelId: string;
  userId: string;
};

@Injectable()
export class StopDiscordCommand {
  private static readonly commandName = "stop";
  private static readonly description = "Disconnect bot from the voice channel";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: StopDiscordCommand.commandName,
    aliases: ["leave", "quit", "disconnect", "dc"],
    description: StopDiscordCommand.description,
  })
  public async prefixHandler(message: Message): Promise<void> {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData) return;

    await this.handler({
      userId: voiceData.member.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });

    await message.react("👋🏻");
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: StopDiscordCommand.commandName,
    description: StopDiscordCommand.description,
  })
  public async slashHandler(@Context() context: SlashCommandContext) {
    const [interaction] = context;
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData) return;

    await this.handler({
      userId: voiceData.member.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });
    await interaction.reply(`Left <#${voiceData.voiceChannel.id}>`);
  }

  private async handler(options: HandlerOptions) {
    const command = new StopCommand({
      voiceChannelId: options.voiceChannelId,
      executor: { id: options.userId },
    });

    await this.commandBus.execute(command);
  }
}
