import * as Joi from "joi";

export const PAGINATION_DEFAULT_LIMIT = 100;

export const PaginationSchema = (limit: number, def?: number) => {
  return {
    page: Joi.number().optional().min(1).default(1),
    limit: Joi.number()
      .optional()
      .min(1)
      .max(limit)
      .default(def || limit),
  };
};
