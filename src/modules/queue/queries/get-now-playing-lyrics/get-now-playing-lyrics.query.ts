import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { LyricsDto } from "@queue/dtos";
import * as Joi from "joi";

export type GetNowPlayingLyricsResult = LyricsDto[];

export class GetNowPlayingLyricsQuery
  extends Query<GetNowPlayingLyricsResult>
  implements IWithExecutor
{
  readonly voiceChannelId?: string;
  readonly executor!: Executor;

  constructor(params: GetNowPlayingLyricsQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetNowPlayingLyricsParamSchema = Joi.object<GetNowPlayingLyricsQuery>({
  voiceChannelId: Joi.string().optional(),
  executor: ExecutorSchema,
}).required();
