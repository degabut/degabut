import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { UserMostPlayedDto } from "@history/dtos";
import * as Joi from "joi";

type MonthData = {
  month: number;
  songPlayed: number;
  durationPlayed: number;
  mostPlayed: UserMostPlayedDto | null;
};

export type GetRecapResult = {
  mostPlayed: UserMostPlayedDto[];
  monthly: MonthData[];
  durationPlayed: number;
  songPlayed: number;
  uniqueSongPlayed: number;
};

export class GetRecapQuery extends Query<GetRecapResult> implements IWithExecutor {
  year!: number;
  executor!: Executor;

  constructor(params: GetRecapQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetRecapParamSchema = Joi.object<GetRecapQuery>({
  year: Joi.number().required().min(2000).max(2999),
  executor: ExecutorSchema,
}).required();
