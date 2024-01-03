import { DiscordUtil } from "@common/utils";
import { CommandResult, IPrefixCommand } from "@discord-bot/interfaces";
import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetLastPlayedQuery, GetMostPlayedQuery } from "@user/queries";
import {
  ActionRowBuilder,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
} from "discord.js";

import { PrefixCommand } from "../decorators";

@Injectable()
@PrefixCommand({
  name: "recommendation",
  aliases: ["recommend", "recommendations"],
})
export class RecommendationDiscordCommand implements IPrefixCommand {
  constructor(private readonly queryBus: QueryBus) {}
  public async prefixHandler(message: Message): Promise<CommandResult> {
    const userId = message.mentions.users.first()?.id || message.author.id;

    const executor = { id: message.author.id };

    const lastPlayedQuery = new GetLastPlayedQuery({
      count: 10,
      userId,
      executor,
    });
    const mostPlayedQuery = new GetMostPlayedQuery({
      days: 30,
      count: 10,
      userId,
      executor,
    });
    const [lastPlayed, mostPlayed] = await Promise.all([
      this.queryBus.execute(lastPlayedQuery),
      this.queryBus.execute(mostPlayedQuery),
    ]);

    const slicedMostPlayed = mostPlayed.slice(0, 7);
    const slicedLastPlayed = lastPlayed
      .filter((v) => !mostPlayed.find((l) => l.id === v.id))
      .slice(0, 10 - slicedMostPlayed.length);
    const mediaSources = [...slicedMostPlayed, ...slicedLastPlayed];
    if (!mediaSources.length) return "No recommendation found";

    const buttons = mediaSources.map((v, i) => DiscordUtil.sourceToMessageButton(v, i));
    const components = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>({ components: buttons.slice(0, 5) }),
    ];
    if (buttons.length > 5)
      components.push(
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: buttons.slice(5, 10),
        }),
      );
    return {
      embeds: [new EmbedBuilder({ fields: mediaSources.map(DiscordUtil.sourceToEmbedField) })],
      components,
    };
  }
}
