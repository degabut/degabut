import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ChangeTrackOrderCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "order",
  aliases: ["o", "move", "mv"],
})
export class OrderPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(message: Message, args: string[]): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const from = +args[0] - 1;
    const to = +args[1] - 1;

    const command = new ChangeTrackOrderCommand({
      voiceChannelId: message.member.voice.channelId,
      from,
      to,
    });

    await this.commandBus.execute(command);
  }
}
