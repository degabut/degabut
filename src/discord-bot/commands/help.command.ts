import { IPrefixCommand } from "@discord-bot/interfaces";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmbedBuilder, Message } from "discord.js";

import { PrefixCommand } from "../decorators";

@Injectable()
@PrefixCommand({
  name: "help",
  aliases: ["h"],
})
export class HelpDiscordCommand implements IPrefixCommand {
  private prefix: string;

  constructor(private readonly configService: ConfigService) {
    this.prefix = this.configService.getOrThrow("discord-bot.prefix");
  }

  public async prefixHandler(message: Message): Promise<void> {
    const description = message.client.prefixCommands
      .map((c) => {
        const { name, aliases } = c.options;
        let d = this.formatCommand(name);
        if (aliases?.length) d += ` (${aliases.map((c) => this.formatCommand(c)).join(", ")})`;
        return d;
      })
      .join("\r\n");

    await message.reply({
      content: "​",
      embeds: [
        new EmbedBuilder({
          title: "Commands",
          description,
        }),
      ],
    });
  }

  private formatCommand(c: string) {
    return `\`${this.prefix}${c}\``;
  }
}
