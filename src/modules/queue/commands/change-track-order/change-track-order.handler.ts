import { ValidateParams } from "@common/decorators";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import { ChangeTrackOrderCommand, ChangeTrackOrderParamSchema } from "./change-track-order.command";

@CommandHandler(ChangeTrackOrderCommand)
export class ChangeTrackOrderHandler implements IInferredCommandHandler<ChangeTrackOrderCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(ChangeTrackOrderParamSchema)
  public async execute(params: ChangeTrackOrderCommand): Promise<void> {
    const { trackId, from, to, voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const trackIdOrIndex = trackId || from;
    if (trackIdOrIndex === undefined) throw new BadRequestException("Invalid options");

    queue.orderTracks(trackIdOrIndex, to, member);
  }
}
