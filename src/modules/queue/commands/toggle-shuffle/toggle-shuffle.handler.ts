import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import {
  ToggleShuffleCommand,
  ToggleShuffleParamSchema,
  ToggleShuffleResult,
} from "./toggle-shuffle.command";

@CommandHandler(ToggleShuffleCommand)
export class ToggleShuffleHandler implements IInferredCommandHandler<ToggleShuffleCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(ToggleShuffleParamSchema)
  public async execute(params: ToggleShuffleCommand): Promise<ToggleShuffleResult> {
    const { voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    return queue.toggleShuffle(member);
  }
}
