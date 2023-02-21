import { IPrefixCommand } from "@discord-bot/interfaces";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { SetPauseCommand } from "@queue-player/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";

@Injectable()
@PrefixCommand({
  name: "pause",
})
export class PauseDiscordCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async prefixHandler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const command = new SetPauseCommand({
      voiceChannelId: message.member.voice.channelId,
      isPaused: true,
      executor: { id: message.author.id },
    });
    await this.commandBus.execute(command);
  }
}
