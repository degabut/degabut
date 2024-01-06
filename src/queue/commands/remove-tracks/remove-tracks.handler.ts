import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { TracksRemovedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";
import { QueueService } from "@queue/services";

import {
  RemoveTracksCommand,
  RemoveTracksParamSchema,
  RemoveTracksResult,
} from "./remove-tracks.command";

@CommandHandler(RemoveTracksCommand)
export class RemoveTracksHandler implements IInferredCommandHandler<RemoveTracksCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly queueRepository: QueueRepository,
    private readonly queueService: QueueService,
  ) {}

  @ValidateParams(RemoveTracksParamSchema)
  public async execute(params: RemoveTracksCommand): Promise<RemoveTracksResult> {
    const { executor, voiceChannelId, trackIds, memberId } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const nowPlaying = queue.nowPlaying;
    const removed = this.queueService.removeTracks(queue, {
      memberId,
      trackIds,
    });

    if (removed.length) {
      this.eventBus.publish(
        new TracksRemovedEvent({
          tracks: removed,
          member,
          hasNowPlaying: removed.some((r) => r.id === nowPlaying?.id),
        }),
      );
    }

    return removed.map((r) => r.id);
  }
}
