import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueAutoplayOptions } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

import {
  ChangeAutoplayOptionsCommand,
  ChangeAutoplayOptionsParamSchema,
} from "./change-autoplay-options.command";

@CommandHandler(ChangeAutoplayOptionsCommand)
export class ChangeAutoplayOptionsHandler
  implements IInferredCommandHandler<ChangeAutoplayOptionsCommand>
{
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(ChangeAutoplayOptionsParamSchema)
  public async execute(params: ChangeAutoplayOptionsCommand): Promise<QueueAutoplayOptions> {
    const { voiceChannelId, executor, ...options } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    queue.setAutoplayOptions(member, options);

    return queue.autoplayOptions;
  }
}
