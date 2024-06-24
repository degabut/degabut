import { CommandExceptionFilter } from "@discord-bot/filters";
import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClearQueueCommand } from "@queue/commands";
import { GuildMember, Message } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";

@Injectable()
export class ClearDiscordCommand {
  private static readonly commandName = "clear";
  private static readonly description = "Clears the queue.";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: ClearDiscordCommand.commandName,
    description: ClearDiscordCommand.description,
  })
  public async prefixHandler(message: Message) {
    if (!message.member) return;
    const result = await this.handler(message.member);
    if (result) await message.react("🗑️");
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: ClearDiscordCommand.commandName,
    description: ClearDiscordCommand.description,
  })
  public async slashHandler(@Context() context: SlashCommandContext) {
    const [interaction] = context;
    if (!(interaction.member instanceof GuildMember)) return;
    const result = await this.handler(interaction.member);
    if (result) await interaction.reply("🗑️");
  }

  private async handler(member: GuildMember): Promise<boolean> {
    if (!member.voice.channelId) return false;

    const command = new ClearQueueCommand({
      voiceChannelId: member.voice.channelId,
      executor: { id: member.user.id },
    });

    await this.commandBus.execute(command);
    return true;
  }
}
