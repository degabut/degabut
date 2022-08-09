import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import { QueueRepository } from "@queue/repositories";

import { GetQueueParamSchema, GetQueueQuery, GetQueueResult } from "./get-queue.query";

@QueryHandler(GetQueueQuery)
export class GetQueueHandler implements IInferredQueryHandler<GetQueueQuery> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(GetQueueParamSchema)
  public async execute(params: GetQueueQuery): Promise<GetQueueResult> {
    const queue = params.voiceChannelId
      ? this.queueRepository.getByVoiceChannelId(params.voiceChannelId)
      : this.queueRepository.getByUserId(params.executor.id);
    if (!queue) throw new NotFoundException("Queue not found");
    if (!queue.hasMember(params.executor.id)) throw new ForbiddenException("Missing permissions");

    return QueueDto.create(queue);
  }
}
