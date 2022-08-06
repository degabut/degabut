import * as Joi from "joi";

export class GetGuildMemberQuery {
  guildId!: string;
  userId!: string;

  constructor(params: GetGuildMemberQuery) {
    Object.assign(this, params);
  }
}

export const GetGuildMemberParamSchema = Joi.object<GetGuildMemberQuery>({
  guildId: Joi.string().required(),
  userId: Joi.string().required(),
}).required();
