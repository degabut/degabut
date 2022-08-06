import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { SetPauseCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "unpause",
  aliases: ["resume"],
})
export class UnpausePrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<void> {
    if (!message.guild) return;

    const command = new SetPauseCommand({
      guildId: message.guild.id,
      isPaused: false,
    });
    await this.commandBus.execute(command);
  }
}
