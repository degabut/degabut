import * as Joi from "joi";

export const ExecutorSchema = Joi.object({
  id: Joi.string().required(),
}).required();
