import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ToggleShuffleCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand, PrefixCommandResult } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "shuffle",
})
export class ShufflePrefixCommand implements IPrefixCommand {
  public readonly name = "shuffle";
  public readonly description = "Toggle shuffle";

  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<PrefixCommandResult> {
    if (!message.guild) return;

    const command = new ToggleShuffleCommand({ guildId: message.guild?.id });
    const isActive = await this.commandBus.execute(command);

    return isActive ? "🔀 **Shuffle enabled**" : "▶ **Shuffle Disabled**";
  }
}
