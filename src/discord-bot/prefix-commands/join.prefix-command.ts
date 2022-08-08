import { DiscordPlayerService } from "@discord-bot/services";
import { Injectable } from "@nestjs/common";
import { BaseGuildTextChannel, Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "join",
  aliases: ["j"],
})
export class JoinPrefixCommand implements IPrefixCommand {
  constructor(private readonly playerService: DiscordPlayerService) {}

  public async handler(message: Message): Promise<void> {
    if (
      !message.member?.voice?.channel ||
      !(message.channel instanceof BaseGuildTextChannel) ||
      !message.guild
    ) {
      return;
    }

    await this.playerService.createPlayer({
      guild: message.guild,
      textChannel: message.channel,
      voiceChannel: message.member.voice.channel,
    });
  }
}
