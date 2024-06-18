import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import {
  RemoveNextTrackCommand,
  RemoveNextTrackParamSchema,
  RemoveNextTrackResult,
} from "./remove-next-track.command";

@CommandHandler(RemoveNextTrackCommand)
export class RemoveNextTrackHandler implements IInferredCommandHandler<RemoveNextTrackCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(RemoveNextTrackParamSchema)
  public async execute(params: RemoveNextTrackCommand): Promise<RemoveNextTrackResult> {
    const { voiceChannelId, trackId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const track = queue.removeNextTrack(trackId, member);

    return track?.id || null;
  }
}
