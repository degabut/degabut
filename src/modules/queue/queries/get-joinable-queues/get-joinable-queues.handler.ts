import { ValidateParams } from "@common/decorators";
import { DiscordService } from "@discord/services";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueueSummaryDto } from "@queue/dtos";
import { QueueRepository } from "@queue/repositories";
import { Client } from "discord.js";

import {
  GetJoinableQueuesParamSchema,
  GetJoinableQueuesQuery,
  GetJoinableQueuesResult,
} from "./get-joinable-queues.query";

@QueryHandler(GetJoinableQueuesQuery)
export class GetJoinableQueuesHandler implements IInferredQueryHandler<GetJoinableQueuesQuery> {
  constructor(
    private readonly client: Client,
    private readonly queueRepository: QueueRepository,
    private readonly discordService: DiscordService,
  ) {}

  @ValidateParams(GetJoinableQueuesParamSchema)
  public async execute(params: GetJoinableQueuesQuery): Promise<GetJoinableQueuesResult> {
    const userId = params.executor.id;
    const queues: QueueSummaryDto[] = [];

    for (const queue of this.queueRepository.getAll()) {
      const guild = this.client.guilds.cache.get(queue.guild.id);
      if (!guild) continue;

      const member = this.discordService.getMemberWithPermissionIn(userId, queue.voiceChannelId);
      if (!member) continue;

      queues.push(QueueSummaryDto.create(queue));
    }

    return queues;
  }
}
