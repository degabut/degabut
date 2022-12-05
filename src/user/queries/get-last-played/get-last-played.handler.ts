import { ValidateParams } from "@common/decorators";
import { UserPlayHistory } from "@history/entities";
import { UserPlayHistoryRepository } from "@history/repositories";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";
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
    if (params.userId && params.userId !== params.executor.id) {
      if (!queue) throw new NotFoundException("Queue not found");
      if (!queue.getMember(params.userId)) throw new ForbiddenException("Missing permissions");
    }
    if ((params.guild || params.voiceChannel) && !queue) {
      throw new NotFoundException("Queue not found");
    }

    let histories: UserPlayHistory[] = [];

    const options = {
      count: params.count,
    };

    if (params.userId) {
      histories = await this.repository.getLastPlayedByUserId(params.userId, options);
    } else if (params.guild && queue) {
      histories = await this.repository.getLastPlayedByGuildId(queue.guildId, {
        ...options,
        excludeUserIds: [params.executor.id],
      });
    } else if (params.voiceChannel && queue) {
      histories = await this.repository.getLastPlayedByVoiceChannelId(queue.voiceChannelId, {
        ...options,
        excludeUserIds: [params.executor.id],
      });
    }

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
