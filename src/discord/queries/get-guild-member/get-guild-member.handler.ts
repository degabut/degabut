import { InjectDiscordClient } from "@discord-nestjs/core";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Client as DiscordClient, GuildMember } from "discord.js";

import { GetGuildMemberQuery } from "./get-guild-member.query";

@QueryHandler(GetGuildMemberQuery)
export class GetGuildMemberCommand
  implements IQueryHandler<GetGuildMemberQuery, GuildMember | undefined>
{
  constructor(
    @InjectDiscordClient()
    private readonly discordClient: DiscordClient,
  ) {}

  public async execute(params: GetGuildMemberQuery): Promise<GuildMember | undefined> {
    const { guildId, userId } = params;

    const guild = await this.discordClient.guilds.fetch(guildId);
    const member = await guild?.members.fetch(userId);

    return member;
  }
}
