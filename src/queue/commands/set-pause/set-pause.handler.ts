import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueuePauseStateChangedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

import { SetPauseCommand, SetPauseParamSchema, SetPauseResult } from "./set-pause.command";

@CommandHandler(SetPauseCommand)
export class SetPauseHandler implements IInferredCommandHandler<SetPauseCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(SetPauseParamSchema)
  public async execute(params: SetPauseCommand): Promise<SetPauseResult> {
    const { voiceChannelId, isPaused, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    if (!queue.hasMember(executor.id)) throw new ForbiddenException("Missing permissions");

    queue.isPaused = isPaused;
    this.eventBus.publish(new QueuePauseStateChangedEvent({ queue }));

    return queue.isPaused;
  }
}
