import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { PlaylistVideoDto } from "@playlist/dtos/playlist-video.dto";
import * as Joi from "joi";

export type GetPlaylistVideosResult = PlaylistVideoDto[];

export class GetPlaylistVideosQuery
  extends Query<GetPlaylistVideosResult>
  implements IWithExecutor
{
  readonly playlistId!: string;
  readonly executor!: Executor;

  constructor(params: GetPlaylistVideosQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetPlaylistVideosParamSchema = Joi.object<GetPlaylistVideosQuery>({
  playlistId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
