import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClearQueueCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "clear",
})
export class ClearPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const command = new ClearQueueCommand({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });
    await this.commandBus.execute(command);
    await message.react("🗑️");
  }
}
