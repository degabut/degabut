import { ValidateParams } from "@common/decorators";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { GetPositionParamSchema, GetPositionQuery, GetPositionResult } from "./get-position.query";

@QueryHandler(GetPositionQuery)
export class GetPositionHandler implements IInferredQueryHandler<GetPositionQuery> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  @ValidateParams(GetPositionParamSchema)
  public async execute(params: GetPositionQuery): Promise<GetPositionResult> {
    const player = this.playerRepository.getByVoiceChannelId(params.voiceChannelId);
    if (!player) throw new NotFoundException("Player not found");
    if (!player.getMember(params.executor.id)) throw new ForbiddenException("Missing permissions");

    return {
      position: player.audioPlayer.accuratePosition || -1,
    };
  }
}
