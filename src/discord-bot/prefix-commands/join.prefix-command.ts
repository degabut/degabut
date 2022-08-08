import { JoinCommand } from "@discord-bot/commands";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { BaseGuildTextChannel, Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "join",
  aliases: ["j"],
})
export class JoinPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message): Promise<void> {
    if (
      !message.member?.voice?.channel ||
      !(message.channel instanceof BaseGuildTextChannel) ||
      !message.guild
    ) {
      return;
    }

    const command = new JoinCommand({
      voiceChannel: message.member.voice.channel,
      textChannel: message.channel,
    });

    await this.commandBus.execute(command);
  }
}
