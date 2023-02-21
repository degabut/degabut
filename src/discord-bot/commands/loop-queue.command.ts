import { CommandResult, IPrefixCommand } from "@discord-bot/interfaces";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ChangeLoopModeCommand } from "@queue/commands";
import { LoopMode } from "@queue/entities";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";

@Injectable()
@PrefixCommand({
  name: "loopqueue",
})
export class LoopQueueDiscordCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async prefixHandler(message: Message): Promise<CommandResult> {
    if (!message.member?.voice.channelId) return;

    const command = new ChangeLoopModeCommand({
      voiceChannelId: message.member.voice.channelId,
      loopMode: LoopMode.Queue,
      executor: { id: message.author.id },
    });

    const loopMode = await this.commandBus.execute(command);

    return loopMode === LoopMode.Queue ? "🔂 **Looping queue**" : "▶ **Loop Disabled**";
  }
}
