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
    if (!message.guild) return;

    const command = new SkipCommand({
      guildId: message.guild.id,
      userId: message.author.id,
    });
    await this.commandBus.execute(command);
  }
}
