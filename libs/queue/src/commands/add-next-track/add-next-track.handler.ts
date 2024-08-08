import { ValidateParams } from "@common/decorators";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import {
  AddNextTrackCommand,
  AddNextTrackParamSchema,
  AddNextTrackResult,
} from "./add-next-track.command";

@CommandHandler(AddNextTrackCommand)
export class AddNextTrackHandler implements IInferredCommandHandler<AddNextTrackCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(AddNextTrackParamSchema)
  public async execute(params: AddNextTrackCommand): Promise<AddNextTrackResult> {
    const { voiceChannelId, index, playNow, trackId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const idOrIndex = trackId || index;
    if (!idOrIndex) throw new BadRequestException("Missing track identifier");

    const track = queue.addNextTrack(idOrIndex, playNow, member);

    return track.id;
  }
}
