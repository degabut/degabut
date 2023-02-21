import { IPrefixCommand } from "@discord-bot/interfaces";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ChangeTrackOrderCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";

@Injectable()
@PrefixCommand({
  name: "order",
  aliases: ["o", "move", "mv"],
})
export class OrderDiscordCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async prefixHandler(message: Message, args: string[]): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const from = +args[0] - 1;
    const to = +args[1] - 1;

    const command = new ChangeTrackOrderCommand({
      voiceChannelId: message.member.voice.channelId,
      from,
      to,
      executor: { id: message.author.id },
    });

    await this.commandBus.execute(command);
  }
}
