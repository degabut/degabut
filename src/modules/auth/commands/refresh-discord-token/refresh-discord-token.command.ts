import { DiscordOAuth2Response } from "@auth/providers";
import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type RefreshDiscordTokenResult = DiscordOAuth2Response;

export class RefreshDiscordTokenCommand extends Command<RefreshDiscordTokenResult> {
  refreshToken!: string;

  constructor(params: RefreshDiscordTokenCommand) {
    super();
    Object.assign(this, params);
  }
}

export const RefreshDiscordTokenParamSchema = Joi.object<RefreshDiscordTokenCommand>({
  refreshToken: Joi.string().required(),
}).required();
