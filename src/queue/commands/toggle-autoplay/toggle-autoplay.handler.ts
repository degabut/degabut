import { ValidateParams } from "@common/decorators";
import { NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import {
  ToggleAutoplayCommand,
  ToggleAutoplayParamSchema,
  ToggleAutoplayResult,
} from "./toggle-autoplay.command";

@CommandHandler(ToggleAutoplayCommand)
export class ToggleAutoplayHandler implements IInferredCommandHandler<ToggleAutoplayCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(ToggleAutoplayParamSchema)
  public async execute(params: ToggleAutoplayCommand): Promise<ToggleAutoplayResult> {
    const { guildId } = params;

    const queue = this.queueRepository.getByGuildId(guildId);
    if (!queue) throw new NotFoundException("Queue not found");

    queue.autoplay = !queue.autoplay;

    return queue.autoplay;
  }
}
