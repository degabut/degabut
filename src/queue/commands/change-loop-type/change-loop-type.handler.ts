import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { LoopType } from "@queue/entities/Queue";
import { QueueRepository } from "@queue/repositories";

import {
  ChangeLoopTypeCommand,
  ChangeLoopTypeParamSchema,
  ChangeLoopTypeResult,
} from "./change-loop-type.command";

@CommandHandler(ChangeLoopTypeCommand)
export class ChangeLoopTypeHandler implements IInferredCommandHandler<ChangeLoopTypeCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(ChangeLoopTypeParamSchema)
  public async execute(params: ChangeLoopTypeCommand): Promise<ChangeLoopTypeResult> {
    const { loopType, voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    if (!queue.hasMember(executor.id)) throw new ForbiddenException("Missing permissions");

    if (!loopType) queue.loopType = LoopType.Disabled;
    else if (queue.loopType === LoopType.Disabled) queue.loopType = loopType;
    else if (queue.loopType === loopType) queue.loopType = LoopType.Disabled;
    else queue.loopType = loopType;

    return queue.loopType;
  }
}
