import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { PlayerFilters } from "@queue-player/providers";
import * as Joi from "joi";

export type SetFiltersResult = PlayerFilters;

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
  filters: Joi.object()
    .keys({
      equalizer: Joi.array()
        .items(
          Joi.object({
            band: Joi.number().required().min(0).max(14),
            gain: Joi.number().required().min(-0.25).max(1),
          }),
        )
        .optional(),
      timescale: Joi.object({
        speed: Joi.number().optional().greater(0).max(10),
        pitch: Joi.number().optional().greater(0).max(10),
        rate: Joi.number().optional().greater(0).max(10),
      }).optional(),
      tremolo: Joi.object({
        frequency: Joi.number().optional().greater(0).max(10),
        depth: Joi.number().optional().greater(0).max(1),
      }).optional(),
      vibrato: Joi.object({
        frequency: Joi.number().optional().greater(0).max(14),
        depth: Joi.number().optional().greater(0).max(1),
      }).optional(),
      rotation: Joi.object({
        rotationHz: Joi.number().optional().greater(0).max(10),
      }).optional(),
      pluginFilters: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
    })
    .required(),
}).required();
