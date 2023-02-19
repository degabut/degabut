import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmbedBuilder, Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "help",
  aliases: ["h"],
})
export class HelpPrefixCommand implements IPrefixCommand {
  private prefix: string;

  constructor(private readonly configService: ConfigService) {
    this.prefix = this.configService.getOrThrow("discord-bot.prefix");
  }

  public async handler(message: Message): Promise<void> {
    const commands = message.client.prefixCommands.sort((a, b) =>
      a.options.name.localeCompare(b.options.name),
    );

    const description = commands
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
