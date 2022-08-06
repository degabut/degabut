import * as Joi from "joi";

export class GetAccessTokenQuery {
  code!: string;

  constructor(params: GetAccessTokenQuery) {
    Object.assign(this, params);
  }
}

export const GetAccessTokenParamSchema = Joi.object<GetAccessTokenQuery>({
  code: Joi.string().required(),
}).required();
