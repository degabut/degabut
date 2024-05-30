import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { SetPauseCommand } from "@queue-player/commands";
import { Message } from "discord.js";

import { TextCommand } from "../decorators";

@Injectable()
export class UnpauseDiscordCommand {
  private static readonly commandName = "unpause";
  private static readonly description = "Unpause the player";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: UnpauseDiscordCommand.commandName,
    description: UnpauseDiscordCommand.description,
  })
  public async prefixHandler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const command = new SetPauseCommand({
      voiceChannelId: message.member.voice.channelId,
      isPaused: false,
      executor: { id: message.author.id },
    });
    await this.commandBus.execute(command);
  }
}
