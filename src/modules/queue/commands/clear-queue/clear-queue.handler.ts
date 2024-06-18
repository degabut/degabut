import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import { ClearQueueCommand, ClearQueueParamSchema } from "./clear-queue.command";

@CommandHandler(ClearQueueCommand)
export class ClearQueueHandler implements IInferredCommandHandler<ClearQueueCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(ClearQueueParamSchema)
  public async execute(params: ClearQueueCommand): Promise<void> {
    const { voiceChannelId, includeNowPlaying, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    queue.clearTracks(!!includeNowPlaying, member);
  }
}
