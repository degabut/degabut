import { Injectable } from "@nestjs/common";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  MessageActionRowComponentBuilder,
} from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "together",
  aliases: ["tg", "activity"],
})
export class TogetherPrefixCommand implements IPrefixCommand {
  public async handler(message: Message, args: string[]): Promise<void> {
    const channel = message.member?.voice.channel;

    const appId = args.shift();

    if (!appId) {
      await message.reply("You need to provide an app id.");
      return;
    }
    if (!channel) {
      await message.reply("You must be in a voice channel!");
      return;
    }

    const invite = await channel.createInvite({
      targetApplication: appId,
      targetType: 2,
      maxUses: 0,
    });

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>({
      components: [
        new ButtonBuilder({
          label: "JOIN",
          style: ButtonStyle.Link,
          url: invite.url,
        }),
      ],
    });

    await message.channel.send({
      content: `**<@!${message.author.id}> has started an activity!** (${appId})`,
      components: [row],
    });
  }
}
