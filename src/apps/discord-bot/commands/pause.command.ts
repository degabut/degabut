import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { SetPauseCommand } from "@queue-player/commands";
import { Message } from "discord.js";

import { TextCommand } from "../decorators";

@Injectable()
export class PauseDiscordCommand {
  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: "pause",
    description: "Pause the player",
  })
  public async prefixHandler(message: Message) {
    if (!message.member?.voice.channelId) return;

    const command = new SetPauseCommand({
      voiceChannelId: message.member.voice.channelId,
      isPaused: true,
      executor: { id: message.author.id },
    });
    await this.commandBus.execute(command);
  }
}
