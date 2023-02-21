import { DiscordUtil } from "@common/utils";
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
import { IPrefixCommand, PrefixCommandResult } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "recommendation",
  aliases: ["recommend", "recommendations"],
})
export class RecommendationPrefixCommand implements IPrefixCommand {
  constructor(private readonly queryBus: QueryBus) {}
  public async handler(message: Message): Promise<PrefixCommandResult> {
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
    const videos = [...slicedMostPlayed, ...slicedLastPlayed];
    if (!videos.length) return "No recommendation found";

    const buttons = videos.map((v, i) => DiscordUtil.videoToMessageButton(v, i));
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
      embeds: [
        new EmbedBuilder({
          fields: videos.map(DiscordUtil.videoToEmbedField),
        }),
      ],
      components,
    };
  }
}
