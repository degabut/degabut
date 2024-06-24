import { DiscordUtil } from "@common/utils";
import { CommandExceptionFilter } from "@discord-bot/filters";
import { MEDIA_SOURCE_SELECT_INTERACTION } from "@discord-bot/interactions/media-source.select-interaction";
import { Injectable, UseFilters } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetLastPlayedQuery, GetMostPlayedQuery } from "@user/queries";
import {
  ActionRowBuilder,
  Message,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  User,
} from "discord.js";
import { Context, Options, SlashCommand, SlashCommandContext, UserOption } from "necord";

import { TextCommand } from "../decorators";

class RecommendationDto {
  @UserOption({ name: "user", description: "User", required: false })
  user?: User;
}

@Injectable()
export class RecommendationDiscordCommand {
  private static readonly commandName = "recommendation";
  private static readonly description =
    "Recommendation based on your last played and most played songs";

  constructor(private readonly queryBus: QueryBus) {}

  @TextCommand({
    name: RecommendationDiscordCommand.commandName,
    description: RecommendationDiscordCommand.description,
  })
  public async prefixHandler(message: Message) {
    const userId = message.mentions.users.first() || message.author;
    const response = await this.handler(userId, message.author.id);
    await message.reply(response);
  }

  @UseFilters(CommandExceptionFilter)
  @SlashCommand({
    name: RecommendationDiscordCommand.commandName,
    description: RecommendationDiscordCommand.description,
  })
  public async slashHandler(
    @Context() context: SlashCommandContext,
    @Options() options: RecommendationDto,
  ) {
    const [interaction] = context;
    const userId = options.user || interaction.user;
    const response = await this.handler(userId, interaction.user.id);
    await interaction.reply(response);
  }

  private async handler(user: User, executorId: string) {
    const executor = { id: executorId };
    const userId = user.id;

    const lastPlayedQuery = new GetLastPlayedQuery({
      limit: 10,
      userId,
      executor,
    });
    const recentMostPlayedQuery = new GetMostPlayedQuery({
      days: 14,
      limit: 5,
      userId,
      executor,
    });
    const mostPlayedQuery = new GetMostPlayedQuery({
      days: 30,
      limit: 10,
      userId,
      executor,
    });
    const [lastPlayed, recentMostPlayed, mostPlayed] = await Promise.all([
      this.queryBus.execute(lastPlayedQuery),
      this.queryBus.execute(recentMostPlayedQuery),
      this.queryBus.execute(mostPlayedQuery),
    ]);

    const mediaSources = [...recentMostPlayed];

    mediaSources.push(
      ...mostPlayed.filter((v) => !recentMostPlayed.find((l) => l.id === v.id)).slice(0, 5),
    );
    mediaSources.push(
      ...lastPlayed
        .filter((v) => !mediaSources.find((l) => l.id === v.id))
        .slice(0, 20 - mediaSources.length),
    );

    if (!mediaSources.length) return "No recommendation found";

    return {
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: [
            new StringSelectMenuBuilder()
              .setCustomId(MEDIA_SOURCE_SELECT_INTERACTION)
              .setPlaceholder(
                executorId === user.id
                  ? "Your Recommendation"
                  : `Recommendation for ${user.displayName}`,
              )
              .setOptions(mediaSources.map(DiscordUtil.sourceToSelectOption)),
          ],
        }),
      ],
    };
  }
}
