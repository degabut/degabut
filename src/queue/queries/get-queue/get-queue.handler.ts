import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import { QueueRepository } from "@queue/repositories";

import { GetQueueParamSchema, GetQueueQuery, GetQueueResult } from "./get-queue.query";

@QueryHandler(GetQueueQuery)
export class GetQueueHandler implements IInferredQueryHandler<GetQueueQuery> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(GetQueueParamSchema)
  public async execute(params: GetQueueQuery): Promise<GetQueueResult> {
    const queue = this.queueRepository.getByGuildId(params.guildId);

    return queue ? QueueDto.create(queue) : null;
  }
}
