import { StopCommand } from "@discord-bot/commands";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "stop",
  aliases: ["disconnect", "dc"],
})
export class StopPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<void> {
    if (!message.guild) return;

    const command = new StopCommand({
      guildId: message.guild.id,
    });

    await this.commandBus.execute(command);
    await message.react("👋🏻");
  }
}
