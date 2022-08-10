import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";
import { UserPlayHistoryRepository } from "@user/repositories";
import { VideoCompactDto } from "@youtube/dtos";
import { VideoRepository } from "@youtube/repositories";

import {
  GetMostPlayedParamSchema,
  GetMostPlayedQuery,
  GetMostPlayedResult,
} from "./get-most-played.query";

@QueryHandler(GetMostPlayedQuery)
export class GetMostPlayedHandler implements IInferredQueryHandler<GetMostPlayedQuery> {
  constructor(
    private readonly repository: UserPlayHistoryRepository,
    private readonly queueRepository: QueueRepository,
    private readonly videoRepository: VideoRepository,
  ) {}

  @ValidateParams(GetMostPlayedParamSchema)
  public async execute(params: GetMostPlayedQuery): Promise<GetMostPlayedResult> {
    const queue = this.queueRepository.getByUserId(params.executor.id);
    if (params.executor.id !== params.userId) {
      if (!queue) throw new NotFoundException("Queue not found");
      if (!queue.hasMember(params.executor.id)) throw new ForbiddenException("Missing permissions");
    }

    const from = new Date();
    from.setDate(from.getDate() - params.days);

    const histories = await this.repository.getMostPlayed(params.userId, {
      count: params.count,
      from,
    });
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
