import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
import { EmbedBuilder, Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand, PrefixCommandResult } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "queue",
  aliases: ["q"],
})
export class QueuePrefixCommand implements IPrefixCommand {
  constructor(private readonly queryBus: QueryBus) {}

  public async handler(message: Message, args: string[]): Promise<PrefixCommandResult> {
    if (!message.member?.voice.channelId) return;

    const page = Number(args.shift() || 1);
    const perPage = 10;

    const query = new GetQueueQuery({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });

    const queue = await this.queryBus.execute(query);

    const { tracks, nowPlaying } = queue;
    const totalLength = tracks.length;
    const slicedTracks = tracks.slice((page - 1) * perPage, page * perPage);

    const start = (page - 1) * perPage;
    const maxPage = Math.max(Math.ceil(totalLength / perPage), 1);
    const embed = new EmbedBuilder({
      title: "Queue",
      description: `Showing page **${page}** / **${maxPage}**`,
      fields: slicedTracks.map((track, index) => {
        let name = `${start + index + 1}. ${track.video.title}`;
        if (track.id === nowPlaying?.id) name = `__${name}__`;

        return {
          name,
          value: `${track.url}\r\nRequested by <@!${track.requestedBy.id}>`,
        };
      }),
    });

    await message.reply({ embeds: [embed] });
  }
}
