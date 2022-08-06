import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RemoveTrackCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "remove",
  aliases: ["rm"],
})
export class RemovePrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message, args: string[]): Promise<void> {
    if (!message.guild) return;

    const index = +args[0];

    const command = new RemoveTrackCommand({
      guildId: message.guild.id,
      userId: message.author.id,
      index: !Number.isNaN(index) ? index - 1 : undefined,
    });
    const removed = await this.commandBus.execute(command);

    if (!removed) await message.reply("Invalid index!");
  }
}
