import { Command } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { Queue, QueueAutoplayOptions, QueueAutoplayType } from "@queue/entities";
import * as Joi from "joi";

export type ChangeAutoplayOptionsResult = QueueAutoplayOptions;

export class ChangeAutoplayOptionsCommand extends Command<QueueAutoplayOptions> {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly includeQueueLastPlayedRelated?: boolean;
  public readonly includeQueueRelated?: boolean;
  public readonly includeUserLibrary?: boolean;
  public readonly includeUserLibraryRelated?: boolean;
  public readonly types?: QueueAutoplayType[];
  public readonly minDuration!: number | null;
  public readonly maxDuration!: number | null;

  constructor(params: ChangeAutoplayOptionsCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ChangeAutoplayOptionsParamSchema = Joi.object<ChangeAutoplayOptionsCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  types: Joi.array()
    .items(Joi.string().valid(...Queue.ALL_AUTOPLAY_TYPES))
    .optional(),
  includeQueueLastPlayedRelated: Joi.boolean().optional(),
  includeQueueRelated: Joi.boolean().optional(),
  includeUserLibrary: Joi.boolean().optional(),
  includeUserLibraryRelated: Joi.boolean().optional(),
  minDuration: Joi.number().min(0).required().allow(null),
  maxDuration: Joi.number().min(0).required().greater(Joi.ref("minDuration")).allow(null),
})
  .required()
  .or(
    "types",
    "includeQueueLastPlayedRelated",
    "includeQueueRelated",
    "includeUserLibrary",
    "includeUserLibraryRelated",
  );
