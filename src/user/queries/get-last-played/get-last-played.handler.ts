import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";
import { UserPlayHistoryRepository } from "@user/repositories";
import { VideoCompactDto } from "@youtube/dtos";
import { VideoRepository } from "@youtube/repositories";

import {
  GetLastPlayedParamSchema,
  GetLastPlayedQuery,
  GetLastPlayedResult,
} from "./get-last-played.query";

@QueryHandler(GetLastPlayedQuery)
export class GetLastPlayedHandler implements IInferredQueryHandler<GetLastPlayedQuery> {
  constructor(
    private readonly repository: UserPlayHistoryRepository,
    private readonly queueRepository: QueueRepository,
    private readonly videoRepository: VideoRepository,
  ) {}

  @ValidateParams(GetLastPlayedParamSchema)
  public async execute(params: GetLastPlayedQuery): Promise<GetLastPlayedResult> {
    const queue = this.queueRepository.getByUserId(params.executor.id);
    if (params.executor.id !== params.userId) {
      if (!queue) throw new NotFoundException("Queue not found");
      if (!queue.hasMember(params.executor.id)) throw new ForbiddenException("Missing permissions");
    }

    const histories = await this.repository.getLastPlayedByUserId(params.userId, params.count);
    if (!histories.length) return [];

    const videos = await this.videoRepository.getByIds(histories.map((h) => h.videoId));
    videos.sort(
      (a, b) =>
        histories.findIndex((h) => h.videoId === a.id) -
        histories.findIndex((h) => h.videoId === b.id),
    );

    return videos.map(VideoCompactDto.create);
  }
}
