import { Command } from "@common/cqrs";
import * as Joi from "joi";

export class StopCommand extends Command {
  readonly guildId!: string;

  constructor(params: StopCommand) {
    super();
    Object.assign(this, params);
  }
}
export const StopParamSchema = Joi.object<StopCommand>({
  guildId: Joi.string().required(),
}).required();
