import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueShuffleToggledEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

import {
  ToggleShuffleCommand,
  ToggleShuffleParamSchema,
  ToggleShuffleResult,
} from "./toggle-shuffle.command";

@CommandHandler(ToggleShuffleCommand)
export class ToggleShuffleHandler implements IInferredCommandHandler<ToggleShuffleCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(ToggleShuffleParamSchema)
  public async execute(params: ToggleShuffleCommand): Promise<ToggleShuffleResult> {
    const { voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    if (!queue.hasMember(executor.id)) throw new ForbiddenException("Missing permissions");

    queue.shuffle = !queue.shuffle;

    if (!queue.shuffle) {
      queue.shuffleHistoryIds = [];
      queue.previousShuffleHistoryIds = [];
    }

    this.eventBus.publish(new QueueShuffleToggledEvent({ queue }));

    return queue.shuffle;
  }
}
