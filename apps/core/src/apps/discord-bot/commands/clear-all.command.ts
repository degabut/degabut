import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClearQueueCommand } from "@queue/commands";
import { GuildMember, Message } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";
import { CommandExceptionFilter } from "../filters";

@Injectable()
export class ClearAllDiscordCommand {
  private static readonly commandName = "clearall";
  private static readonly description = "Clears the queue, including the now playing song.";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: ClearAllDiscordCommand.commandName,
    description: ClearAllDiscordCommand.description,
  })
  public async prefixHandler(message: Message) {
    if (!message.member) return;
    const result = await this.handler(message.member);
    if (result) await message.react("🗑️");
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: ClearAllDiscordCommand.commandName,
    description: ClearAllDiscordCommand.description,
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
      includeNowPlaying: true,
      executor: { id: member.user.id },
    });

    await this.commandBus.execute(command);
    return true;
  }
}
