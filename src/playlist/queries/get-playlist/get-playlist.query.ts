import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { PlaylistDto } from "@playlist/dtos";
import * as Joi from "joi";

export type GetPlaylistResult = PlaylistDto;

export class GetPlaylistQuery extends Query<GetPlaylistResult> implements IWithExecutor {
  readonly playlistId!: string;
  readonly executor!: Executor;

  constructor(params: GetPlaylistQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetPlaylistParamSchema = Joi.object<GetPlaylistQuery>({
  playlistId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
