import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
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
    const { voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    return queue.toggleAutoplay(member);
  }
}
