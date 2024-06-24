import { CommandExceptionFilter } from "@discord-bot/filters";
import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ChangeLoopModeCommand } from "@queue/commands";
import { LoopMode } from "@queue/entities";
import { GuildMember, Message } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";

@Injectable()
export class LoopDiscordCommand {
  private static readonly commandName = "loop";
  private static readonly description = "Toggle loop current track";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: LoopDiscordCommand.commandName,
    description: LoopDiscordCommand.description,
  })
  public async prefixHandler(message: Message) {
    if (!message.member?.voice.channelId) return;
    return this.handler(message.member);
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: LoopDiscordCommand.commandName,
    description: LoopDiscordCommand.description,
  })
  public async slashHandler(@Context() context: SlashCommandContext) {
    const [interaction] = context;
    if (!(interaction.member instanceof GuildMember)) return;
    return this.handler(interaction.member);
  }

  private async handler(member: GuildMember): Promise<string | undefined> {
    if (!member.voice.channelId) return;

    const command = new ChangeLoopModeCommand({
      voiceChannelId: member.voice.channelId,
      loopMode: LoopMode.Track,
      executor: { id: member.user.id },
    });

    const loopMode = await this.commandBus.execute(command);
    return loopMode === LoopMode.Track ? "🔂 **Looping current track**" : "▶ **Loop Disabled**";
  }
}
