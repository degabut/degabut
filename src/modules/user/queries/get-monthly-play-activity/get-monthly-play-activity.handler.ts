import { ValidateParams } from "@common/decorators";
import { UserMonthlyPlayActivityDto } from "@history/dtos";
import { UserMonthlyPlayActivityRepository } from "@history/repositories";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import {
  GetMonthlyPlayActivityParamSchema,
  GetMonthlyPlayActivityQuery,
  GetMonthlyPlayActivityResult,
} from "./get-monthly-play-activity.query";

@QueryHandler(GetMonthlyPlayActivityQuery)
export class GetMonthlyPlayActivityHandler
  implements IInferredQueryHandler<GetMonthlyPlayActivityQuery>
{
  constructor(
    private readonly repository: UserMonthlyPlayActivityRepository,
    private readonly queueRepository: QueueRepository,
  ) {}

  @ValidateParams(GetMonthlyPlayActivityParamSchema)
  public async execute(params: GetMonthlyPlayActivityQuery): Promise<GetMonthlyPlayActivityResult> {
    if (params.userId && params.userId !== params.executor.id) {
      const queue = this.queueRepository.getByUserId(params.executor.id);
      if (!queue) throw new NotFoundException("Queue not found");
      if (!queue.getMember(params.userId)) throw new ForbiddenException("Missing permissions");
    }

    const userId = params.userId || params.executor.id;

    const activities = await this.repository.getActivity(userId, params.from, params.to);

    return activities.map(UserMonthlyPlayActivityDto.create);
  }
}
