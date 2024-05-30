import { PaginatedQuery } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema, PAGINATION_DEFAULT_LIMIT, PaginationSchema } from "@common/schemas";
import { PlaylistMediaSourceDto } from "@playlist/dtos";
import * as Joi from "joi";

export type GetPlaylistMediaSourcesResult = PlaylistMediaSourceDto[];

export class GetPlaylistMediaSourcesQuery
  extends PaginatedQuery<GetPlaylistMediaSourcesResult>
  implements IWithExecutor
{
  readonly playlistId!: string;
  readonly executor!: Executor;

  constructor(params: GetPlaylistMediaSourcesQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetPlaylistMediaSourcesParamSchema = Joi.object<GetPlaylistMediaSourcesQuery>({
  playlistId: Joi.string().required(),
  ...PaginationSchema(PAGINATION_DEFAULT_LIMIT),
  executor: ExecutorSchema,
}).required();
