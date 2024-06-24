import { AsyncUtil, DiscordUtil, YoutubeUtil } from "@common/utils";
import { SpotifyUtil } from "@common/utils/spotify.util";
import { CommandExceptionFilter } from "@discord-bot/filters";
import { Injectable, NotFoundException, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JoinCommand } from "@queue-player/commands";
import { AddTracksCommand } from "@queue/commands";
import { BaseGuildTextChannel, BaseGuildVoiceChannel, Message } from "discord.js";
import { Context, Options, SlashCommand, SlashCommandContext, StringOption } from "necord";

import { TextCommand } from "../decorators";

class PlayDto {
  @StringOption({ name: "keyword", description: "Search keyword", required: true, min_length: 1 })
  keyword!: string;
}

type AddTrackOptions = {
  voiceChannel: BaseGuildVoiceChannel;
  userId: string;
  keyword: string;
};

type JoinOptions = {
  voiceChannel: BaseGuildVoiceChannel;
  textChannel: BaseGuildTextChannel;
  userId: string;
};

@Injectable()
export class PlayDiscordCommand {
  private static readonly commandName = "play";
  private static readonly description = "Add a song to queue by keyword";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: PlayDiscordCommand.commandName,
    aliases: ["p"],
    description: PlayDiscordCommand.description,
  })
  public async prefixHandler(message: Message, args: string[]) {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData || !(message.channel instanceof BaseGuildTextChannel)) return;
    const keyword = args.join(" ");

    await this.handler({
      userId: message.author.id,
      voiceChannel: voiceData.voiceChannel,
      textChannel: message.channel,
      keyword,
    });
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: PlayDiscordCommand.commandName,
    description: PlayDiscordCommand.description,
  })
  async slashHandler(@Context() context: SlashCommandContext, @Options() options: PlayDto) {
    const [interaction] = context;
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData || !(interaction.channel instanceof BaseGuildTextChannel)) return;
    const { keyword } = options;

    await this.handler({
      userId: interaction.user.id,
      voiceChannel: voiceData.voiceChannel,
      textChannel: interaction.channel,
      keyword,
    });

    await interaction.deferReply();
    await interaction.deleteReply();
  }

  private async handler(options: AddTrackOptions & JoinOptions) {
    try {
      await this.addTrack({
        keyword: options.keyword,
        userId: options.userId,
        voiceChannel: options.voiceChannel,
      });
    } catch (err) {
      if (!(err instanceof NotFoundException)) throw err;
      await this.join(options);
      await AsyncUtil.sleep(1000);
      await this.addTrack({
        keyword: options.keyword,
        userId: options.userId,
        voiceChannel: options.voiceChannel,
      });
    }
  }

  private async addTrack(options: AddTrackOptions) {
    if (!options.keyword) throw new NotFoundException("Keyword not found");

    const youtubeIds = YoutubeUtil.extractIds(options.keyword);
    const spotifyIds = SpotifyUtil.extractIds(options.keyword);

    if (youtubeIds.playlistId || spotifyIds.playlistId || spotifyIds.albumId) {
      const adapter = new AddTracksCommand({
        voiceChannelId: options.voiceChannel.id,
        youtubePlaylistId: youtubeIds.playlistId,
        spotifyPlaylistId: spotifyIds.playlistId,
        spotifyAlbumId: spotifyIds.albumId,
        executor: { id: options.userId },
      });
      await this.commandBus.execute(adapter);
    } else {
      const mediaSourceId = youtubeIds.videoId
        ? `youtube/${youtubeIds.videoId}`
        : spotifyIds.trackId
          ? `spotify/${spotifyIds.trackId}`
          : undefined;

      const adapter = new AddTracksCommand({
        voiceChannelId: options.voiceChannel.id,
        mediaSourceId,
        youtubeKeyword: mediaSourceId ? undefined : options.keyword,
        executor: { id: options.userId },
      });
      await this.commandBus.execute(adapter);
    }
  }

  private async join(options: JoinOptions) {
    const command = new JoinCommand({
      voiceChannel: options.voiceChannel,
      textChannel: options.textChannel,
      executor: { id: options.userId },
    });

    await this.commandBus.execute(command);
  }
}
