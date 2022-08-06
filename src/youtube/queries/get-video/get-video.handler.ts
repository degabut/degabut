import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { VideoDto } from "@youtube/dtos";
import { YoutubeiProvider } from "@youtube/providers";

import { GetVideoParamSchema, GetVideoQuery, GetVideoResult } from "./get-video.query";

@QueryHandler(GetVideoQuery)
export class GetVideoHandler implements IInferredQueryHandler<GetVideoQuery> {
  constructor(private readonly youtubeiProvider: YoutubeiProvider) {}

  @ValidateParams(GetVideoParamSchema)
  public async execute(params: GetVideoQuery): Promise<GetVideoResult> {
    const video = await this.youtubeiProvider.getVideo(params.id);

    return video ? VideoDto.create(video) : null;
  }
}
