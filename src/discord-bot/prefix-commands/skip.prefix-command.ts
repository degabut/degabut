import { SkipCommand } from "@discord-bot/commands";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
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
      member: message.member,
    });

    await this.commandBus.execute(command);
  }
}
