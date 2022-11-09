import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { PlaylistDto } from "@playlist/dtos";
import * as Joi from "joi";

export type GetPlaylistsResult = PlaylistDto[];

export class GetPlaylistsQuery extends Query<GetPlaylistsResult> implements IWithExecutor {
  readonly executor!: Executor;

  constructor(params: GetPlaylistsQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetPlaylistsParamSchema = Joi.object<GetPlaylistsQuery>({
  executor: ExecutorSchema,
}).required();
