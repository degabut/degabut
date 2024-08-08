import { DiscordUtil } from "@common/utils";
import { Injectable, UseFilters } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
import { GuildMember, Message } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";
import { CommandExceptionFilter } from "../filters";

@Injectable()
export class NowPlayingDiscordCommand {
  private static readonly commandName = "nowplaying";
  private static readonly description = "Shows the current playing song";

  constructor(private readonly queryBus: QueryBus) {}

  @TextCommand({
    name: NowPlayingDiscordCommand.commandName,
    aliases: ["np"],
    description: NowPlayingDiscordCommand.description,
  })
  public async prefixHandler(message: Message) {
    if (!message.member) return;

    const result = await this.handler(message.member);
    if (!result) return;

    await message.reply(result);
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: NowPlayingDiscordCommand.commandName,
    description: NowPlayingDiscordCommand.description,
  })
  public async slashHandler(@Context() context: SlashCommandContext) {
    const [interaction] = context;
    if (!(interaction.member instanceof GuildMember)) return;

    const result = await this.handler(interaction.member);
    if (!result) return;

    await interaction.reply(result);
  }

  private async handler(member: GuildMember) {
    if (!member.voice.channelId) return;

    const query = new GetQueueQuery({
      voiceChannelId: member.voice.channelId,
      executor: { id: member.user.id },
    });
    const queue = await this.queryBus.execute(query);
    const track = queue?.nowPlaying;
    if (!track) return;

    return { embeds: [DiscordUtil.trackToEmbed(track)] };
  }
}
