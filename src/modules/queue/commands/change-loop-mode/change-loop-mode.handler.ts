import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { LoopMode } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

import {
  ChangeLoopModeCommand,
  ChangeLoopModeParamSchema,
  ChangeLoopModeResult,
} from "./change-loop-mode.command";

@CommandHandler(ChangeLoopModeCommand)
export class ChangeLoopModeHandler implements IInferredCommandHandler<ChangeLoopModeCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(ChangeLoopModeParamSchema)
  public async execute(params: ChangeLoopModeCommand): Promise<ChangeLoopModeResult> {
    const { loopMode, voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    return queue.changeLoopMode(loopMode || LoopMode.Disabled, member);
  }
}
