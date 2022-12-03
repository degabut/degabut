import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { LoopMode } from "@queue/entities";
import { QueueLoopModeChangedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

import {
  ChangeLoopModeCommand,
  ChangeLoopModeParamSchema,
  ChangeLoopModeResult,
} from "./change-loop-mode.command";

@CommandHandler(ChangeLoopModeCommand)
export class ChangeLoopModeHandler implements IInferredCommandHandler<ChangeLoopModeCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(ChangeLoopModeParamSchema)
  public async execute(params: ChangeLoopModeCommand): Promise<ChangeLoopModeResult> {
    const { loopMode, voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    if (!loopMode) queue.loopMode = LoopMode.Disabled;
    else if (queue.loopMode === LoopMode.Disabled) queue.loopMode = loopMode;
    else if (queue.loopMode === loopMode) queue.loopMode = LoopMode.Disabled;
    else queue.loopMode = loopMode;

    this.eventBus.publish(new QueueLoopModeChangedEvent({ queue, member }));

    return queue.loopMode;
  }
}
