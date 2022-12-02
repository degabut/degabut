import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type SetFiltersResult = void;

export type PlayerFilters = {
  volume?: number;
  equalizers?: { band: number; gain: number }[];
};

export class SetFiltersCommand extends Command<SetFiltersResult> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly filters!: PlayerFilters;

  constructor(params: SetFiltersCommand) {
    super();
    Object.assign(this, params);
  }
}

export const SetFiltersParamSchema = Joi.object<SetFiltersCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  filters: Joi.object<PlayerFilters>({
    volume: Joi.number().min(0).max(5).optional(),
    equalizers: Joi.array()
      .items(
        Joi.object({
          band: Joi.number().min(0).max(14),
          gain: Joi.number().min(-0.25).max(1),
        }),
      )
      .optional(),
  }),
}).required();
