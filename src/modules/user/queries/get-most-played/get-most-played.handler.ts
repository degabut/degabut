import { ValidateParams } from "@common/decorators";
import { UserMostPlayedDto } from "@history/dtos";
import { UserPlayHistoryRepository } from "@history/repositories";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

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
  ) {}

  @ValidateParams(GetMostPlayedParamSchema)
  public async execute(params: GetMostPlayedQuery): Promise<GetMostPlayedResult> {
    const queue = this.queueRepository.getByUserId(params.executor.id);
    if (params.userId && params.userId !== params.executor.id) {
      if (!queue) throw new NotFoundException("Queue not found");
      if (!queue.getMember(params.userId)) throw new ForbiddenException("Missing permissions");
    }
    if ((params.guild || params.voiceChannel) && !queue) {
      throw new NotFoundException("Queue not found");
    }

    const from = new Date();
    from.setDate(from.getDate() - params.days);
    const options = {
      includeContent: true,
      limit: params.limit,
      from,
    };

    let histories: UserMostPlayedDto[] = [];

    if (params.userId) {
      histories = await this.repository.getMostPlayedByUserId(params.userId, options);
    } else if (params.guild && queue) {
      histories = await this.repository.getMostPlayedByGuildId(queue.guild.id, {
        ...options,
        excludeUserIds: [params.executor.id],
      });
    } else if (params.voiceChannel && queue) {
      histories = await this.repository.getMostPlayedByVoiceChannelId(queue.voiceChannelId, {
        ...options,
        excludeUserIds: [params.executor.id],
      });
    }

    return histories.filter((h) => h.mediaSource).map((h) => h.mediaSource);
  }
}
