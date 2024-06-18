import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import {
  RemoveTrackCommand,
  RemoveTrackParamSchema,
  RemoveTrackResult,
} from "./remove-track.command";

@CommandHandler(RemoveTrackCommand)
export class RemoveTrackHandler implements IInferredCommandHandler<RemoveTrackCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(RemoveTrackParamSchema)
  public async execute(params: RemoveTrackCommand): Promise<RemoveTrackResult> {
    const { executor, voiceChannelId, index, trackId, isNowPlaying } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const removed = queue.removeTrack({ index, trackId, isNowPlaying }, member);

    return removed?.id || null;
  }
}
