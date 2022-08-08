import { ValidateParams } from "@common/decorators";
import { NotFoundException } from "@nestjs/common";
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
    const { voiceChannelId } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");

    queue.shuffle = !queue.shuffle;

    if (!queue.shuffle) {
      queue.shuffleHistoryIds = [];
      queue.previousShuffleHistoryIds = [];
    }

    return queue.shuffle;
  }
}
