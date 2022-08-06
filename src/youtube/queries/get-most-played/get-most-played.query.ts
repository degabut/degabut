import { Query } from "@common/cqrs";
import { VideoCompactDto } from "@youtube/dtos";
import * as Joi from "joi";

export type GetMostPlayedResult = VideoCompactDto[];

export class GetMostPlayedQuery extends Query<GetMostPlayedResult> {
  count!: number;
  days!: number;
  userId!: string;

  constructor(params: GetMostPlayedQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetMostPlayedParamSchema = Joi.object<GetMostPlayedQuery>({
  count: Joi.number().required(),
  days: Joi.number().required(),
  userId: Joi.string().required(),
}).required();
