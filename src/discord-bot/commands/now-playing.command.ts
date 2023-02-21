import { DiscordUtil } from "@common/utils";
import { IPrefixCommand } from "@discord-bot/interfaces";
import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";

@Injectable()
@PrefixCommand({
  name: "nowplaying",
  aliases: ["np"],
})
export class NowPlayingDiscordCommand implements IPrefixCommand {
  constructor(private readonly queryBus: QueryBus) {}

  public async prefixHandler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const query = new GetQueueQuery({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });
    const queue = await this.queryBus.execute(query);

    const track = queue?.nowPlaying;

    if (!track) return;

    await message.reply({ embeds: [DiscordUtil.trackToEmbed(track)] });
  }
}
