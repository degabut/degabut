import { DiscordOAuthProvider } from "@auth/providers";
import { ValidateParams } from "@common/decorators";
import { UnauthorizedException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";

import {
  RefreshDiscordTokenCommand,
  RefreshDiscordTokenParamSchema,
  RefreshDiscordTokenResult,
} from "./refresh-discord-token.command";

@CommandHandler(RefreshDiscordTokenCommand)
export class RefreshDiscordTokenHandler
  implements IInferredCommandHandler<RefreshDiscordTokenCommand>
{
  constructor(private readonly discordOAuthProvider: DiscordOAuthProvider) {}

  @ValidateParams(RefreshDiscordTokenParamSchema)
  public async execute(params: RefreshDiscordTokenCommand): Promise<RefreshDiscordTokenResult> {
    try {
      const response = await this.discordOAuthProvider.refreshAccessToken(params.refreshToken);
      return response;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
