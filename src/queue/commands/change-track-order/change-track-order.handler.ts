import { ValidateParams } from "@common/decorators";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { TrackOrderChangedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

import { ChangeTrackOrderCommand, ChangeTrackOrderParamSchema } from "./change-track-order.command";

@CommandHandler(ChangeTrackOrderCommand)
export class ChangeTrackOrderHandler implements IInferredCommandHandler<ChangeTrackOrderCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(ChangeTrackOrderParamSchema)
  public async execute(params: ChangeTrackOrderCommand): Promise<void> {
    const { trackId, from, to, voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const fromIndex = from ? from : queue.tracks.findIndex((track) => track.id === trackId);

    const track = queue.tracks.at(fromIndex);
    if (!track) throw new BadRequestException("Track not found");
    queue.tracks.splice(fromIndex, 1);
    queue.tracks.splice(to, 0, track);

    this.eventBus.publish(new TrackOrderChangedEvent({ track, to, member }));
  }
}
