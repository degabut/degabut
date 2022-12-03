import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ChangeLoopModeCommand } from "@queue/commands";
import { LoopMode } from "@queue/entities";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand, PrefixCommandResult } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "loop",
})
export class LoopPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<PrefixCommandResult> {
    if (!message.member?.voice.channelId) return;

    const command = new ChangeLoopModeCommand({
      voiceChannelId: message.member.voice.channelId,
      loopMode: LoopMode.Track,
      executor: { id: message.author.id },
    });

    const loopMode = await this.commandBus.execute(command);

    return loopMode === LoopMode.Track ? "🔂 **Looping curent track**" : "▶ **Loop Disabled**";
  }
}
