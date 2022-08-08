import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ChangeLoopTypeCommand } from "@queue/commands";
import { LoopType } from "@queue/entities";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand, PrefixCommandResult } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "loopqueue",
})
export class LoopQueuePrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<PrefixCommandResult> {
    if (!message.guild) return;

    const command = new ChangeLoopTypeCommand({
      guildId: message.guild?.id,
      loopType: LoopType.Queue,
    });

    const loopType = await this.commandBus.execute(command);

    return loopType === LoopType.Queue ? "🔂 **Looping Queue**" : "▶ **Loop Queue Disabled**";
  }
}
