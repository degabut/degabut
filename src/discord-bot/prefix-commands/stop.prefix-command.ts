import { DiscordPlayerService } from "@discord-bot/services";
import { Injectable } from "@nestjs/common";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "stop",
  aliases: ["disconnect", "dc"],
})
export class StopPrefixCommand implements IPrefixCommand {
  constructor(private readonly playerService: DiscordPlayerService) {}

  public async handler(message: Message): Promise<void> {
    if (!message.guild) return;

    this.playerService.stopPlayer(message.guild.id);

    await message.react("👋🏻");
  }
}
