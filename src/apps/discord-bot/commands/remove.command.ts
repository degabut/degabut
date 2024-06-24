import { DiscordUtil } from "@common/utils";
import { CommandExceptionFilter } from "@discord-bot/filters";
import { CommandResult } from "@discord-bot/interfaces";
import { Injectable, UseFilters, UseInterceptors } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RemoveTrackCommand, RemoveTracksCommand } from "@queue/commands";
import { GetQueueQuery } from "@queue/queries";
import { AutocompleteInteraction, GuildMember, Message } from "discord.js";
import {
  AutocompleteInterceptor,
  Context,
  MemberOption,
  NumberOption,
  Options,
  SlashCommand,
  SlashCommandContext,
  StringOption,
} from "necord";

import { TextCommand } from "../decorators";

@Injectable()
class TrackAutocompleteInterceptor extends AutocompleteInterceptor {
  constructor(private readonly queryBus: QueryBus) {
    super();
  }

  public async transformOptions(interaction: AutocompleteInteraction) {
    const voiceChannelId = DiscordUtil.getVoiceFromInteraction(interaction)?.voiceChannel.id;
    if (!voiceChannelId) return;

    const focused = interaction.options.getFocused(true);
    if (focused.name !== "name") return;

    const queue = await this.queryBus.execute(
      new GetQueueQuery({ voiceChannelId, executor: { id: interaction.user.id } }),
    );

    return interaction.respond(
      queue.tracks
        .map((t) => ({
          name: (t.mediaSource.title + " - " + t.mediaSource.creator).substring(0, 100),
          value: t.id,
        }))
        .filter((t) => t.name.toLowerCase().includes(focused.value.toLowerCase()))
        .slice(-25),
    );
  }
}

class RemoveDto {
  @StringOption({
    name: "name",
    description: "Track name",
    autocomplete: true,
    required: false,
  })
  trackId?: string;

  @NumberOption({
    name: "position",
    description: "Track position",
    required: false,
    min_value: 1,
  })
  position?: number;

  @MemberOption({
    name: "user",
    description: "Song that was added by this user",
    required: false,
  })
  member?: GuildMember;
}

type HandlerOptions = {
  position?: number;
  trackId?: string;
  member?: GuildMember;
  voiceChannelId: string;
  userId: string;
};

@Injectable()
export class RemoveDiscordCommand {
  private static readonly commandName = "remove";
  private static readonly description = "Remove a track from queue";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: RemoveDiscordCommand.commandName,
    description: RemoveDiscordCommand.description,
  })
  public async prefixHandler(message: Message, args: string[]): Promise<CommandResult> {
    if (!message.member?.voice.channelId) return;

    const position = +args[0];
    const member = message.mentions.members?.first();

    const removed = await this.handler({
      userId: message.author.id,
      voiceChannelId: message.member.voice.channelId,
      position,
      member,
    });
    if (!removed) await message.reply("Invalid remove option!");
  }

  @UseInterceptors(TrackAutocompleteInterceptor)
  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: RemoveDiscordCommand.commandName,
    description: RemoveDiscordCommand.description,
    guilds: ["954618520560361512"],
  })
  async slashHandler(@Context() context: SlashCommandContext, @Options() options: RemoveDto) {
    const [interaction] = context;
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData) return;

    const removed = await this.handler({
      userId: interaction.user.id,
      voiceChannelId: voiceData.voiceChannel.id,
      ...options,
    });

    if (!removed) {
      await interaction.reply("Invalid remove option!");
    } else {
      await interaction.deferReply();
      await interaction.deleteReply();
    }
  }

  private async handler(options: HandlerOptions) {
    const { position, trackId, voiceChannelId, userId, member } = options;

    if (member) {
      const command = new RemoveTracksCommand({
        voiceChannelId,
        memberId: member.id,
        executor: { id: userId },
      });

      return await this.commandBus.execute(command);
    } else {
      const removeOptions =
        position !== undefined && Number.isSafeInteger(position)
          ? { index: position - 1 }
          : trackId
            ? { trackId }
            : { isNowPlaying: true };

      const command = new RemoveTrackCommand({
        voiceChannelId,
        ...removeOptions,
        executor: { id: userId },
      });

      return await this.commandBus.execute(command);
    }
  }
}
