import { Query } from "@common/cqrs";
import { TranscriptDto } from "@youtube/dtos";
import * as Joi from "joi";

export type GetVideoTranscriptResult = TranscriptDto[] | null;

export class GetVideoTranscriptQuery extends Query<GetVideoTranscriptResult> {
  id!: string;

  constructor(params: GetVideoTranscriptQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetVideoTranscriptParamSchema = Joi.object<GetVideoTranscriptQuery>({
  id: Joi.string().required(),
}).required();
