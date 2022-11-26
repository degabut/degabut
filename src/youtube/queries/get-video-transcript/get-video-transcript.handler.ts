import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { TranscriptDto } from "@youtube/dtos";
import { YoutubeiProvider } from "@youtube/providers";

import {
  GetVideoTranscriptParamSchema,
  GetVideoTranscriptQuery,
  GetVideoTranscriptResult,
} from "./get-video-transcript.query";

@QueryHandler(GetVideoTranscriptQuery)
export class GetVideoTranscriptHandler implements IInferredQueryHandler<GetVideoTranscriptQuery> {
  constructor(private readonly youtubeiProvider: YoutubeiProvider) {}

  @ValidateParams(GetVideoTranscriptParamSchema)
  public async execute(params: GetVideoTranscriptQuery): Promise<GetVideoTranscriptResult> {
    const transcripts = await this.youtubeiProvider.getVideoTranscript(params.id);
    return transcripts ? transcripts.map(TranscriptDto.create) : null;
  }
}
