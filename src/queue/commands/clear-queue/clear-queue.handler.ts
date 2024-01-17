import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueClearedEvent } from "@queue/events/queue-cleared.event";
import { QueueRepository } from "@queue/repositories";
import { QueueService } from "@queue/services";

import { ClearQueueCommand, ClearQueueParamSchema } from "./clear-queue.command";

@CommandHandler(ClearQueueCommand)
export class ClearQueueHandler implements IInferredCommandHandler<ClearQueueCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly queueService: QueueService,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(ClearQueueParamSchema)
  public async execute(params: ClearQueueCommand): Promise<void> {
    const { voiceChannelId, includeNowPlaying, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    queue.tracks = queue.tracks.filter((t) => t.id === queue.nowPlaying?.id);
    if (includeNowPlaying) this.queueService.removeTrack(queue, true);

    this.eventBus.publish(
      new QueueClearedEvent({ queue, member, includeNowPlaying: !!includeNowPlaying }),
    );
  }
}
