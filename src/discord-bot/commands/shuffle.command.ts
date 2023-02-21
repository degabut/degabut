import { CommandResult, IPrefixCommand } from "@discord-bot/interfaces";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ToggleShuffleCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";

@Injectable()
@PrefixCommand({
  name: "shuffle",
})
export class ShuffleDiscordCommand implements IPrefixCommand {
  public readonly name = "shuffle";
  public readonly description = "Toggle shuffle";

  constructor(private readonly commandBus: CommandBus) {}

  public async prefixHandler(message: Message): Promise<CommandResult> {
    if (!message.member?.voice.channelId) return;

    const command = new ToggleShuffleCommand({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });
    const isActive = await this.commandBus.execute(command);

    return isActive ? "🔀 **Shuffle enabled**" : "▶ **Shuffle Disabled**";
  }
}
