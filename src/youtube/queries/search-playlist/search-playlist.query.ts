import { Query } from "@common/cqrs";
import { PlaylistCompactDto } from "@youtube/dtos";
import * as Joi from "joi";

export type SearchPlaylistResult = PlaylistCompactDto[];

export class SearchPlaylistQuery extends Query<SearchPlaylistResult> {
  keyword!: string;

  constructor(params: SearchPlaylistQuery) {
    super();
    Object.assign(this, params);
  }
}

export const SearchPlaylistParamSchema = Joi.object<SearchPlaylistQuery>({
  keyword: Joi.string().required(),
}).required();
