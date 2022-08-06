import { YoutubeUtil } from "@common/utils";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AddTrackCommand } from "@queue/commands";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "play",
  aliases: ["p"],
})
export class PlayPrefixCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  async handler(message: Message, args: string[]) {
    if (!message.guild) return;

    const keyword = args.join(" ");
    const videoId = YoutubeUtil.extractYoutubeVideoId(keyword);

    const adapter = new AddTrackCommand({
      guildId: message.guild?.id,
      videoId: videoId || undefined,
      keyword: videoId ? undefined : keyword,
      requestedBy: message.author.id,
    });

    await this.commandBus.execute(adapter);
  }
}
