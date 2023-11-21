import * as Joi from "joi";

export const PaginationSchema = (def: number, limit: number) => {
  return {
    nextToken: Joi.string().optional(),
    limit: Joi.number().optional().min(1).max(limit).default(def),
  };
};
