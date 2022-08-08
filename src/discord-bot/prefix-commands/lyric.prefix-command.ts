// import { Lyric } from "@modules/lyric/entities/Lyric";
import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand, PrefixCommandResult } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "lyric",
  aliases: ["lyrics"],
})
export class LyricPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  public async handler(message: Message, args: string[]): Promise<PrefixCommandResult> {
    // const keyword = args.join(" ");

    // let lyric: Lyric;

    // if (keyword) {
    //   // const adapter = new GetLyricAdapter({ keyword });
    //   // lyric = await this.queryBus.execute(adapter, {
    //   //   userId: message.author.id,
    //   // });
    // } else {
    //   const query = new GetQueueQuery({ guildId: message.guild?.id });

    //   // lyric = await this.getNowPlayingLyric.execute(adapter, {
    //   //   userId: message.author.id,
    //   // });
    // }

    // let maxLength = 4096;
    // maxLength -= lyric.sourceUrl.length - 16;

    // const embed = new EmbedBuilder({
    //   title: `${lyric.author} — ${lyric.title}`,
    //   description: [
    //     lyric.sourceUrl,
    //     "",
    //     lyric.content.length > maxLength
    //       ? lyric.content.slice(0, maxLength) + "..."
    //       : lyric.content,
    //   ].join("\n"),
    // });

    return "";
  }
}
