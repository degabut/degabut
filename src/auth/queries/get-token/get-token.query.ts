import { Query } from "@common/cqrs";
import * as Joi from "joi";

export type GetTokenResult = { token: string };

export class GetTokenQuery extends Query<GetTokenResult> {
  code!: string;

  constructor(params: GetTokenQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetTokenParamSchema = Joi.object<GetTokenQuery>({
  code: Joi.string().required(),
}).required();
