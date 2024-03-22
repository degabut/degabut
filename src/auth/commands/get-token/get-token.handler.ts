import { DiscordOAuthProvider, JwtAuthProvider } from "@auth/providers";
import { ValidateParams } from "@common/decorators";
import { UnauthorizedException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";

import { GetTokenCommand, GetTokenParamSchema, GetTokenResult } from "./get-token.command";

@CommandHandler(GetTokenCommand)
export class GetTokenHandler implements IInferredCommandHandler<GetTokenCommand> {
  constructor(
    private readonly discordOAuthProvider: DiscordOAuthProvider,
    private readonly jwtAuthProvider: JwtAuthProvider,
  ) {}

  @ValidateParams(GetTokenParamSchema)
  public async execute(params: GetTokenCommand): Promise<GetTokenResult> {
    try {
      const discordAccessToken = await this.discordOAuthProvider.getAccessToken(
        params.code,
        params.redirectUri,
      );
      const user = await this.discordOAuthProvider.getCurrentUser(discordAccessToken);

      const token = this.jwtAuthProvider.sign(user.id);
      return { token, discordAccessToken };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
