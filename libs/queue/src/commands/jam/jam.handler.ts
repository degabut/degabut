import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import { JamCommand, JamParamSchema } from "./jam.command";

@CommandHandler(JamCommand)
export class JamHandler implements IInferredCommandHandler<JamCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(JamParamSchema)
  public async execute(params: JamCommand): Promise<void> {
    const { voiceChannelId, count, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    queue.jam(count, member);
  }
}
