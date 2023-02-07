import { YoutubeUtil } from "@common/utils";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JoinCommand } from "@queue-player/commands";
import { AddTrackCommand } from "@queue/commands";
import { BaseGuildTextChannel, Message } from "discord.js";

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
    if (!message.member?.voice.channelId) return;

    const keyword = args.join(" ");

    try {
      await this.addTrack(message, keyword);
    } catch (err) {
      if (!(err instanceof NotFoundException)) throw err;
      await this.joinAndAddTrack(message, keyword);
    }
  }

  private async joinAndAddTrack(message: Message, keyword: string, delay = 1000) {
    await this.join(message);
    await new Promise((r) => setTimeout(r, delay));
    await this.addTrack(message, keyword);
  }

  private async addTrack(message: Message, keyword: string) {
    if (!message.member?.voice.channelId) return;

    const videoId = YoutubeUtil.extractYoutubeVideoId(keyword);

    const adapter = new AddTrackCommand({
      voiceChannelId: message.member.voice.channelId,
      videoId: videoId || undefined,
      keyword: videoId ? undefined : keyword,
      executor: { id: message.author.id },
    });
    await this.commandBus.execute(adapter);
  }

  private async join(message: Message) {
    if (
      !message.member?.voice?.channel ||
      !(message.channel instanceof BaseGuildTextChannel) ||
      !message.guild
    ) {
      return;
    }

    const command = new JoinCommand({
      voiceChannel: message.member.voice.channel,
      textChannel: message.channel,
      executor: { id: message.author.id },
    });

    await this.commandBus.execute(command);
  }
}
