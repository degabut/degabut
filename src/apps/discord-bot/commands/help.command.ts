import { Injectable } from "@nestjs/common";
import { EmbedBuilder, Message } from "discord.js";

import { TextCommand } from "../decorators";

@Injectable()
export class HelpDiscordCommand {
  @TextCommand({
    name: "help",
    aliases: ["h"],
  })
  public async prefixHandler(message: Message): Promise<void> {
    const prefix = message.client.prefix;
    const description = message.client.prefixCommands
      .map((c) => {
        const { name, aliases } = c.options;
        let d = this.formatCommand(prefix, name);
        if (aliases?.length) {
          d += ` (${aliases.map((c) => this.formatCommand(prefix, c)).join(", ")})`;
        }
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

  private formatCommand(prefix: string, c: string) {
    return `\`${prefix}${c}\``;
  }
}
