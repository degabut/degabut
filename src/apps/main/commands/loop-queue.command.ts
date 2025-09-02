import { CommandExceptionFilter } from "@main/filters";
import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ChangeLoopModeCommand } from "@queue/commands";
import { LoopMode } from "@queue/entities";
import { GuildMember, Message } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";

@Injectable()
export class LoopQueueDiscordCommand {
  private static readonly commandName = "loopqueue";
  private static readonly description = "Toggle loop queue";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: LoopQueueDiscordCommand.commandName,
    description: LoopQueueDiscordCommand.description,
  })
  public async prefixHandler(message: Message) {
    if (!message.member?.voice.channelId) return;
    const result = await this.handler(message.member);
    if (result) await message.react("🔂");
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: LoopQueueDiscordCommand.commandName,
    description: LoopQueueDiscordCommand.description,
  })
  public async slashHandler(@Context() context: SlashCommandContext) {
    const [interaction] = context;
    if (!(interaction.member instanceof GuildMember) || !interaction.member?.voice.channelId) {
      return;
    }
    const result = await this.handler(interaction.member);
    if (result) await interaction.reply(result);
  }

  private async handler(member: GuildMember): Promise<string | undefined> {
    if (!member.voice.channelId) return;

    const command = new ChangeLoopModeCommand({
      voiceChannelId: member.voice.channelId,
      loopMode: LoopMode.Queue,
      executor: { id: member.user.id },
    });

    const loopMode = await this.commandBus.execute(command);
    return loopMode === LoopMode.Queue ? "🔂 **Looping queue**" : "▶ **Loop Disabled**";
  }
}
