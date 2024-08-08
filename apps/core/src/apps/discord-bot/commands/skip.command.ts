import { DiscordUtil } from "@common/utils";
import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { SkipCommand } from "@queue-player/commands";
import { Message } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";
import { CommandExceptionFilter } from "../filters";

type HandlerOptions = {
  voiceChannelId: string;
  userId: string;
};

@Injectable()
export class SkipDiscordCommand {
  private static readonly commandName = "skip";
  private static readonly description = "Skip current song";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: SkipDiscordCommand.commandName,
    description: SkipDiscordCommand.description,
  })
  public async prefixHandler(message: Message): Promise<void> {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData) return;

    await this.handler({
      userId: voiceData.member.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: SkipDiscordCommand.commandName,
    description: SkipDiscordCommand.description,
  })
  public async slashHandler(@Context() context: SlashCommandContext) {
    const [interaction] = context;
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData) return;

    await this.handler({
      userId: voiceData.member.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });

    await interaction.deferReply();
    await interaction.deleteReply();
  }

  private async handler(options: HandlerOptions) {
    const command = new SkipCommand({
      voiceChannelId: options.voiceChannelId,
      executor: { id: options.userId },
    });

    await this.commandBus.execute(command);
  }
}
