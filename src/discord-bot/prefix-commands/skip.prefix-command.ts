import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { SkipCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "skip",
})
export class SkipPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const command = new SkipCommand({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });

    await this.commandBus.execute(command);
  }
}
