import { ValidateParams } from "@common/decorators";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";

import { PlayTrackCommand, PlayTrackParamSchema } from "./play-track.command";

@CommandHandler(PlayTrackCommand)
export class PlayTrackHandler implements IInferredCommandHandler<PlayTrackCommand> {
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(PlayTrackParamSchema)
  public async execute(params: PlayTrackCommand): Promise<string> {
    const { voiceChannelId, index, trackId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const idOrIndex = trackId || index;
    if (!idOrIndex) throw new BadRequestException("Missing track identifier");

    const track = queue.playTrack(idOrIndex, member);

    return track.id;
  }
}
