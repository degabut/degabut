import { DiscordUtil } from "@common/utils";
import { CommandExceptionFilter } from "@discord-bot/filters";
import { Injectable, UseFilters } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
import { EmbedBuilder, Message } from "discord.js";
import { Context, NumberOption, Options, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";

class QueueDto {
  @NumberOption({
    name: "page",
    description: "Page",
    required: false,
    min_value: 1,
  })
  page?: number;
}

type HandlerOptions = {
  page?: number;
  voiceChannelId: string;
  userId: string;
};

@Injectable()
export class QueueDiscordCommand {
  private static readonly commandName = "queue";
  private static readonly description = "Show the queue";

  constructor(private readonly queryBus: QueryBus) {}

  @TextCommand({
    name: QueueDiscordCommand.commandName,
    aliases: ["q"],
    description: QueueDiscordCommand.description,
  })
  public async prefixHandler(message: Message, args: string[]) {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData) return;

    const page = Number(args.shift() || 1);
    const result = await this.handler({
      page,
      voiceChannelId: voiceData.voiceChannel.id,
      userId: voiceData.member.id,
    });

    await message.reply(result);
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: QueueDiscordCommand.commandName,
    description: QueueDiscordCommand.description,
  })
  public async slashHandler(@Context() context: SlashCommandContext, @Options() options: QueueDto) {
    const [interaction] = context;
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData) return;

    const { page = 1 } = options;
    const result = await this.handler({
      page,
      voiceChannelId: voiceData.voiceChannel.id,
      userId: interaction.user.id,
    });
    await interaction.reply(result);
  }

  private async handler(options: HandlerOptions) {
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
