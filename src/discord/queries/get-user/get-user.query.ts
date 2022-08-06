import { GetQueueQuery } from "@queue/queries";
import * as Joi from "joi";

export class GetUserQuery {
  accessToken!: string;

  constructor(params: GetQueueQuery) {
    Object.assign(this, params);
  }
}

export const GetUserQueryParamSchema = Joi.object<GetUserQuery>({
  accessToken: Joi.string().required(),
}).required();
