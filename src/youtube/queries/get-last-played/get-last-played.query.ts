import { Query } from "@common/cqrs";
import { VideoCompactDto } from "@youtube/dtos";
import * as Joi from "joi";

export type GetLastPlayedResult = VideoCompactDto[];

export class GetLastPlayedQuery extends Query<GetLastPlayedResult> {
  count!: number;
  userId!: string;

  constructor(params: GetLastPlayedQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetLastPlayedParamSchema = Joi.object<GetLastPlayedQuery>({
  count: Joi.number().required(),
  userId: Joi.string().required(),
}).required();
