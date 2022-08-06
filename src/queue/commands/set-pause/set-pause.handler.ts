import { ValidateParams } from "@common/decorators";
import { NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueuePausedEvent } from "@queue/events";
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
    const { guildId, isPaused } = params;

    const queue = this.queueRepository.getByGuildId(guildId);
    if (!queue) throw new NotFoundException("Queue not found");

    queue.isPaused = isPaused;
    this.eventBus.publish(new QueuePausedEvent({ queue }));

    return queue.isPaused;
  }
}
