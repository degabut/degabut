import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ToggleShuffleCommand } from "@queue/commands";
import { Message } from "discord.js";

import { TextCommand } from "../decorators";

@Injectable()
export class ShuffleDiscordCommand {
  private static readonly commandName = "shuffle";
  private static readonly description = "Toggle shuffle";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: ShuffleDiscordCommand.commandName,
    description: ShuffleDiscordCommand.description,
  })
  public async prefixHandler(message: Message) {
    if (!message.member?.voice.channelId) return;

    const command = new ToggleShuffleCommand({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });
    const isActive = await this.commandBus.execute(command);

    await message.reply(isActive ? "🔀 **Shuffle enabled**" : "▶ **Shuffle Disabled**");
  }
}
