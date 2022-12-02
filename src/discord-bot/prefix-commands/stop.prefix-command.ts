import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { StopCommand } from "@queue-player/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "stop",
  aliases: ["disconnect", "dc", "leave"],
})
export class StopPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const command = new StopCommand({
      voiceChannelId: message.member.voice.channelId,
    });

    await this.commandBus.execute(command);
    await message.react("👋🏻");
  }
}
