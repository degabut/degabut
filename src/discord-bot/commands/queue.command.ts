import { DiscordUtil } from "@common/utils";
import { CommandResult, IPrefixCommand } from "@discord-bot/interfaces";
import { SlashCommandPipe } from "@discord-nestjs/common";
import { Command, Handler, InteractionEvent, Param, ParamType } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
import { CommandInteraction, EmbedBuilder, Message } from "discord.js";

import { PrefixCommand } from "../decorators";

class QueueDto {
  @Param({
    description: "Page",
    required: false,
    type: ParamType.INTEGER,
    minValue: 1,
  })
  page?: number;
}

type HandlerOptions = {
  page?: number;
  voiceChannelId: string;
  userId: string;
};

@Injectable()
@PrefixCommand({
  name: "queue",
  aliases: ["q"],
})
@Command({
  name: "queue",
  description: "Show tracks in queue",
})
export class QueueDiscordCommand implements IPrefixCommand {
  constructor(private readonly queryBus: QueryBus) {}

  @Handler()
  public async slashHandler(
    @InteractionEvent() interaction: CommandInteraction,
    @InteractionEvent(SlashCommandPipe) options: QueueDto,
  ) {
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData) return;

    const { page = 1 } = options;
    return await this.handler({
      page,
      voiceChannelId: voiceData.voiceChannel.id,
      userId: interaction.user.id,
    });
  }

  public async prefixHandler(message: Message, args: string[]): Promise<CommandResult> {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData) return;

    const page = Number(args.shift() || 1);
    return await this.handler({
      page,
      voiceChannelId: voiceData.voiceChannel.id,
      userId: voiceData.member.id,
    });
  }

  private async handler(options: HandlerOptions): Promise<CommandResult> {
    const { page = 1, voiceChannelId, userId } = options;
    const perPage = 10;

    const query = new GetQueueQuery({
      voiceChannelId,
      executor: { id: userId },
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
        let name = `${start + index + 1}. ${track.mediaSource.title}`;
        if (track.id === nowPlaying?.id) name = `__${name}__`;

        return {
          name,
          value: `${track.mediaSource.url}\r\nRequested by <@!${track.requestedBy.id}>`,
        };
      }),
    });

    return { embeds: [embed] };
  }
}
