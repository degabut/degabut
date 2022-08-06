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
    if (!message.guild) return;

    const page = Number(args.shift() || 1);
    const perPage = 10;

    const query = new GetQueueQuery({
      guildId: message.guild.id,
    });

    const queue = await this.queryBus.execute(query);
    if (!queue) return;

    const { tracks, nowPlaying } = queue;
    const totalLength = tracks.length;

    const start = (page - 1) * perPage;
    const embed = new EmbedBuilder({
      title: "Queue",
      description: `Showing page **${page}** / **${Math.ceil(totalLength / perPage)}**`,
      fields: tracks.map((track, index) => {
        let name = `${start + index + 1}. ${track.video.title}`;
        if (track.id === nowPlaying?.id) name = `__${name}__`;

        return {
          name,
          value: `${track.url}\r\nRequested by <@!${track.requestedBy}>`,
        };
      }),
    });

    await message.reply({ embeds: [embed] });
  }
}
