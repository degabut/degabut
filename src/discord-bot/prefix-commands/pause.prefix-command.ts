import { SetPauseCommand } from "@discord-bot/commands";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "pause",
})
export class PausePrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const command = new SetPauseCommand({
      voiceChannelId: message.member.voice.channelId,
      isPaused: true,
      executor: { id: message.author.id },
    });
    await this.commandBus.execute(command);
  }
}
