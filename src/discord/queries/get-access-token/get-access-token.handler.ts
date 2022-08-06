import { ValidateParams } from "@common/decorators";
import { DiscordOAuthProvider } from "@discord/providers";
import { BadRequestException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { GetAccessTokenParamSchema, GetAccessTokenQuery } from "./get-access-token.query";

type Response = string;

@QueryHandler(GetAccessTokenQuery)
export class GetAccessTokenCommand implements IQueryHandler<GetAccessTokenQuery, string> {
  constructor(private readonly discordOAuthProvider: DiscordOAuthProvider) {}

  @ValidateParams(GetAccessTokenParamSchema)
  public async execute(params: GetAccessTokenQuery): Promise<Response> {
    const { code } = params;

    const token = await this.discordOAuthProvider.getAccessToken(code);
    if (!token) throw new BadRequestException("Invalid Access Token.");

    return token;
  }
}
