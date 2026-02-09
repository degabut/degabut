import { ValidateParams } from "@common/decorators";
import { NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import { LeaveCommand, LeaveParamSchema } from "./leave.command";

@CommandHandler(LeaveCommand)
export class LeaveHandler implements IInferredCommandHandler<LeaveCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(LeaveParamSchema)
  public async execute(params: LeaveCommand): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(params.voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found.");

    queue.removeMember(params.executor.id);
  }
}
