import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ChangeTrackOrderCommand } from "@queue/commands";
import { Message } from "discord.js";

import { TextCommand } from "../decorators";

@Injectable()
export class OrderDiscordCommand {
  private static readonly commandName = "order";
  private static readonly description = "Order tracks in the queue";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: OrderDiscordCommand.commandName,
    aliases: ["move", "mv"],
    description: OrderDiscordCommand.description,
  })
  public async prefixHandler(message: Message, args: string[]) {
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
