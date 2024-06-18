import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import {
  RemoveTracksCommand,
  RemoveTracksParamSchema,
  RemoveTracksResult,
} from "./remove-tracks.command";

@CommandHandler(RemoveTracksCommand)
export class RemoveTracksHandler implements IInferredCommandHandler<RemoveTracksCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(RemoveTracksParamSchema)
  public async execute(params: RemoveTracksCommand): Promise<RemoveTracksResult> {
    const { executor, voiceChannelId, trackIds, memberId } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const removed = queue.removeTracks({ trackIds, memberId }, member);

    return removed.map((r) => r.id);
  }
}
