import { ValidateParams } from "@common/decorators";
import { DiscordService } from "@discord/services";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import { Queue } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

import { GetQueueParamSchema, GetQueueQuery, GetQueueResult } from "./get-queue.query";

@QueryHandler(GetQueueQuery)
export class GetQueueHandler implements IInferredQueryHandler<GetQueueQuery> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly discordService: DiscordService,
  ) {}

  @ValidateParams(GetQueueParamSchema)
  public async execute(params: GetQueueQuery): Promise<GetQueueResult> {
    let queue: Queue | undefined;

    if (params.voiceChannelId) {
      queue = this.queueRepository.getByVoiceChannelId(params.voiceChannelId);
    } else if (params.guildId) {
      queue = this.queueRepository.getByGuildId(params.guildId);
    } else {
      queue = this.queueRepository.getByUserId(params.executor.id);
    }

    if (!queue) throw new NotFoundException("Queue not found");

    if (params.guildId) {
      const hasPermission = !!(await this.discordService.getMemberWithPermissionIn(
        params.executor.id,
        queue.voiceChannelId,
      ));
      if (!hasPermission) throw new ForbiddenException("Missing permissions");
    } else {
      if (!queue.getMember(params.executor.id)) throw new ForbiddenException("Missing permissions");
    }

    return QueueDto.create(queue);
  }
}
