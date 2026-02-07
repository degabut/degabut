import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import { QueueRepository } from "@queue/repositories";

import { GetQueueSResult, GetQueuesParamSchema, GetQueuesQuery } from "./get-queues.query";

@QueryHandler(GetQueuesQuery)
export class GetQueuesHandler implements IInferredQueryHandler<GetQueuesQuery> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(GetQueuesParamSchema)
  public async execute(params: GetQueuesQuery): Promise<GetQueueSResult> {
    const queues = this.queueRepository.getManyByUserId(params.executor.id);
    const activeQueues = queues.filter((q) => !!q.getMember(params.executor.id, true));

    return activeQueues.map(QueueDto.create);
  }
}
