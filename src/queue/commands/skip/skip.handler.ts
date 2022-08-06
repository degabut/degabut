import { ValidateParams } from "@common/decorators";
import { NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

import { SkipCommand, SkipParamSchema, SkipResult } from "./skip.command";

@CommandHandler(SkipCommand)
export class SkipHandler implements IInferredCommandHandler<SkipCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly queueRepository: QueueRepository,
  ) {}

  @ValidateParams(SkipParamSchema)
  public async execute(params: SkipCommand): Promise<SkipResult> {
    const { userId, guildId } = params;

    const queue = this.queueRepository.getByGuildId(guildId);
    if (!queue) throw new NotFoundException("Queue not found");

    const skipped = queue.nowPlaying;
    if (!skipped) return null;

    this.eventBus.publish(
      new TrackSkippedEvent({
        track: skipped,
        skippedBy: userId,
      }),
    );
    // TODO logic currently handled in track-ended.handler

    return skipped.id || null;
  }
}
