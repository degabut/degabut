import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type GetPositionResult = {
  position: number;
};

export class GetPositionQuery extends Query<GetPositionResult> implements IWithExecutor {
  readonly voiceChannelId!: string;
  readonly executor!: Executor;

  constructor(params: GetPositionQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetPositionParamSchema = Joi.object<GetPositionQuery>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
