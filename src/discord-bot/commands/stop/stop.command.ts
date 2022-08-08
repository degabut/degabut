import { Command } from "@common/cqrs";
import * as Joi from "joi";

export class StopCommand extends Command {
  readonly voiceChannelId!: string;

  constructor(params: StopCommand) {
    super();
    Object.assign(this, params);
  }
}
export const StopParamSchema = Joi.object<StopCommand>({
  voiceChannelId: Joi.string().required(),
}).required();
