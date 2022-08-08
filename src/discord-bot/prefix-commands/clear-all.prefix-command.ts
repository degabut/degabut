import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClearQueueCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "clearall",
})
export class ClearAllPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<void> {
    if (!message.guild) return;

    const command = new ClearQueueCommand({
      guildId: message.guild.id,
      removeNowPlaying: true,
    });

    await this.commandBus.execute(command);
    await message.react("🗑️");
  }
}
