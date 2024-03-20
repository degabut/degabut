import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type GetTokenResult = { token: string };

export class GetTokenCommand extends Command<GetTokenResult> {
  code!: string;
  redirectUri?: string;

  constructor(params: GetTokenCommand) {
    super();
    Object.assign(this, params);
  }
}

export const GetTokenParamSchema = Joi.object<GetTokenCommand>({
  code: Joi.string().required(),
  redirectUri: Joi.string().uri().optional(),
}).required();
