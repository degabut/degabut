import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import { PingCommand, PingParamSchema } from "./ping.command";

@CommandHandler(PingCommand)
export class PingHandler implements IInferredCommandHandler<PingCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(PingParamSchema)
  public async execute(params: PingCommand): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(params.voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found.");

    const pinged = queue.pingMember(params.executor.id);
    if (!pinged) throw new ForbiddenException("Missing permissions");
  }
}
