import { Query } from "@common/cqrs";
import { VideoCompactDto } from "@youtube/dtos";
import * as Joi from "joi";

export type SearchVideoResult = VideoCompactDto[];

export class SearchVideoQuery extends Query<SearchVideoResult> {
  keyword!: string;

  constructor(params: SearchVideoQuery) {
    super();
    Object.assign(this, params);
  }
}

export const SearchVideoParamSchema = Joi.object<SearchVideoQuery>({
  keyword: Joi.string().required(),
}).required();
