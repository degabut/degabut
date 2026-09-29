import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";

import {
  GetQueuePlayerStreamParamSchema,
  GetQueuePlayerStreamQuery,
  GetQueuePlayerStreamResult,
} from "./get-queue-player-stream.query";

@QueryHandler(GetQueuePlayerStreamQuery)
export class GetQueuePlayerStreamHandler
  implements IInferredQueryHandler<GetQueuePlayerStreamQuery>
{
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  @ValidateParams(GetQueuePlayerStreamParamSchema)
  public async execute(params: GetQueuePlayerStreamQuery): Promise<GetQueuePlayerStreamResult> {
    const player = this.playerRepository.getByVoiceChannelId(params.voiceChannelId);
    if (!player) throw new NotFoundException("Player not found");

    const userId = player.resolveStreamToken(params.token);
    if (!userId) throw new ForbiddenException("Invalid stream token");

    const release = player.acquireStreamSlot(userId);
    if (!release) throw new ForbiddenException("Too many concurrent streams");

    try {
      return await player.audioPlayer.openLiveStream(release);
    } catch (error) {
      release();
      throw error;
    }
  }
}
