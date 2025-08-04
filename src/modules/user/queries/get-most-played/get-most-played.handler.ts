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

    let excludeIds: string[] | undefined;
    if (params.excludeFrom) {
      const options = {
        includeContent: true,
        from: params.excludeFrom,
        to: params.excludeTo,
        limit: 100,
      };

      let excludedHistories: UserMostPlayedDto[] = [];

      if (params.userId) {
        excludedHistories = await this.repository.getMostPlayedByUserId(params.userId, options);
      } else if (params.guild && queue) {
        excludedHistories = await this.repository.getMostPlayedByGuildId(queue.guild.id, {
          ...options,
          excludeUserIds: [params.executor.id],
        });
      } else if (params.voiceChannel && queue) {
        excludedHistories = await this.repository.getMostPlayedByVoiceChannelId(
          queue.voiceChannelId,
          {
            ...options,
            excludeUserIds: [params.executor.id],
          },
        );
      }

      const excludedCount = Math.floor(excludedHistories.length * 0.25); // top 25%
      excludeIds = excludedHistories.slice(0, excludedCount).map((h) => h.mediaSourceId);
    }

    let from = new Date();
    let to: undefined | Date;

    if (params.days) {
      from = new Date();
      from.setDate(from.getDate() - params.days);
    } else if (params.from) {
      from = params.from;
      to = params.to;
    }

    const options = {
      includeContent: true,
      limit: params.limit,
      excludeIds,
      from,
      to,
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
