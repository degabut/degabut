import { Command } from "@common/cqrs";
import { LoopType } from "@queue/entities";
import * as Joi from "joi";

export type ChangeLoopTypeResult = LoopType;

export class ChangeLoopTypeCommand extends Command<ChangeLoopTypeResult> {
  voiceChannelId!: string;
  loopType?: LoopType;

  constructor(params: ChangeLoopTypeCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ChangeLoopTypeParamSchema = Joi.object<ChangeLoopTypeCommand>({
  voiceChannelId: Joi.string().required(),
  loopType: Joi.string().valid(...Object.values(LoopType)),
}).required();
