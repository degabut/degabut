import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ToggleAutoplayCommand } from "@queue/commands";
import { Message } from "discord.js";

import { TextCommand } from "../decorators";

@Injectable()
export class AutoplayDiscordCommand {
  private static readonly commandName = "autoplay";
  private static readonly description = "Toggle autoplay";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: AutoplayDiscordCommand.commandName,
    description: AutoplayDiscordCommand.description,
  })
  public async prefixHandler(message: Message) {
    if (!message.member?.voice.channelId) return;

    const command = new ToggleAutoplayCommand({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });
    const isActive = await this.commandBus.execute(command);

    await message.reply(isActive ? "▶ **Autoplay enabled**" : "❌ **Autoplay Disabled**");
  }
}
