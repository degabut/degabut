import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ChangeLoopTypeCommand } from "@queue/commands";
import { LoopType } from "@queue/entities";
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

    const command = new ChangeLoopTypeCommand({
      voiceChannelId: message.member.voice.channelId,
      loopType: LoopType.Song,
    });

    const loopType = await this.commandBus.execute(command);

    return loopType === LoopType.Song ? "🔂 **Looping Song**" : "▶ **Loop Song Disabled**";
  }
}
