import { ValidateParams } from "@common/decorators";
import { ForbiddenException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import { QueueRepository } from "@queue/repositories";

import { GetQueueParamSchema, GetQueueQuery, GetQueueResult } from "./get-queue.query";

@QueryHandler(GetQueueQuery)
export class GetQueueHandler implements IInferredQueryHandler<GetQueueQuery> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(GetQueueParamSchema)
  public async execute(params: GetQueueQuery): Promise<GetQueueResult> {
    const queue = this.queueRepository.getByVoiceChannelId(params.voiceChannelId);
    if (!queue) return null;
    if (!queue.hasMember(params.executor.id)) throw new ForbiddenException("Missing permissions");

    return QueueDto.create(queue);
  }
}
