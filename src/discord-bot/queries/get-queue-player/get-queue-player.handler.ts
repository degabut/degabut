import { ValidateParams } from "@common/decorators";
import { QueuePlayerDto } from "@discord-bot/dtos";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";

import {
  GetQueuePlayerParamSchema,
  GetQueuePlayerQuery,
  GetQueuePlayerResult,
} from "./get-queue-player.query";

@QueryHandler(GetQueuePlayerQuery)
export class GetQueuePlayerHandler implements IInferredQueryHandler<GetQueuePlayerQuery> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  @ValidateParams(GetQueuePlayerParamSchema)
  public async execute(params: GetQueuePlayerQuery): Promise<GetQueuePlayerResult> {
    const player = this.playerRepository.getByVoiceChannelId(params.voiceChannelId);
    if (!player) throw new NotFoundException("Player not found");
    if (!player.getMember(params.executor.id)) throw new ForbiddenException("Missing permissions");

    return QueuePlayerDto.create(player);
  }
}
