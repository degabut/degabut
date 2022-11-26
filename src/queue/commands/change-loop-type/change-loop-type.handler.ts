import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { LoopType } from "@queue/entities";
import { QueueLoopTypeChangedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

import {
  ChangeLoopTypeCommand,
  ChangeLoopTypeParamSchema,
  ChangeLoopTypeResult,
} from "./change-loop-type.command";

@CommandHandler(ChangeLoopTypeCommand)
export class ChangeLoopTypeHandler implements IInferredCommandHandler<ChangeLoopTypeCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(ChangeLoopTypeParamSchema)
  public async execute(params: ChangeLoopTypeCommand): Promise<ChangeLoopTypeResult> {
    const { loopType, voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    if (!loopType) queue.loopType = LoopType.Disabled;
    else if (queue.loopType === LoopType.Disabled) queue.loopType = loopType;
    else if (queue.loopType === loopType) queue.loopType = LoopType.Disabled;
    else queue.loopType = loopType;

    this.eventBus.publish(new QueueLoopTypeChangedEvent({ queue, member }));

    return queue.loopType;
  }
}
