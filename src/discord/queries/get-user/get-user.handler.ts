import { DiscordOAuthProvider } from "@discord/providers";
import { BadRequestException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { APIUser } from "discord-api-types/v9";

import { GetUserQuery } from "./get-user.query";

@QueryHandler(GetUserQuery)
export class GetUserCommand implements IQueryHandler<GetUserQuery, APIUser> {
  constructor(private readonly discordOAuthProvider: DiscordOAuthProvider) {}

  public async execute(params: GetUserQuery): Promise<APIUser> {
    const { accessToken } = params;

    const user = await this.discordOAuthProvider.getCurrentUser(accessToken);
    if (!user) throw new BadRequestException("Invalid Access Token.");

    return user;
  }
}
