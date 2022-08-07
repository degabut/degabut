import { DiscordOAuthProvider, JwtAuthProvider } from "@auth/providers";
import { ValidateParams } from "@common/decorators";
import { UnauthorizedException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { GetTokenParamSchema, GetTokenQuery, GetTokenResult } from "./get-token.query";

@QueryHandler(GetTokenQuery)
export class GetTokenHandler implements IInferredQueryHandler<GetTokenQuery> {
  constructor(
    private readonly discordOAuthProvider: DiscordOAuthProvider,
    private readonly jwtAuthProvider: JwtAuthProvider,
  ) {}

  @ValidateParams(GetTokenParamSchema)
  public async execute(params: GetTokenQuery): Promise<GetTokenResult> {
    try {
      const accessToken = await this.discordOAuthProvider.getAccessToken(params.code);
      const user = await this.discordOAuthProvider.getCurrentUser(accessToken);

      const token = this.jwtAuthProvider.sign(user.id);
      return { token };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
