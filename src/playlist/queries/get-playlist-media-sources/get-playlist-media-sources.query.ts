import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { PlaylistMediaSourceDto } from "@playlist/dtos";
import * as Joi from "joi";

export type GetPlaylistMediaSourcesResult = PlaylistMediaSourceDto[];

export class GetPlaylistMediaSourcesQuery
  extends Query<GetPlaylistMediaSourcesResult>
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
  executor: ExecutorSchema,
}).required();
