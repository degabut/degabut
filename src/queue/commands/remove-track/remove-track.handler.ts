import { ValidateParams } from "@common/decorators";
import { NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { TrackRemovedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";
import { QueueService } from "@queue/services";

import {
  RemoveTrackCommand,
  RemoveTrackParamSchema,
  RemoveTrackResult,
} from "./remove-track.command";

@CommandHandler(RemoveTrackCommand)
export class RemoveTrackHandler implements IInferredCommandHandler<RemoveTrackCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly queueRepository: QueueRepository,
    private readonly queueService: QueueService,
  ) {}

  @ValidateParams(RemoveTrackParamSchema)
  public async execute(params: RemoveTrackCommand): Promise<RemoveTrackResult> {
    const { userId, voiceChannelId, index, trackId, isNowPlaying } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");

    const nowPlaying = queue.nowPlaying;
    const removed = this.queueService.removeTrack(
      queue,
      isNowPlaying || trackId || (index ?? queue.tracks.length - 1),
    );

    if (removed) {
      this.eventBus.publish(
        new TrackRemovedEvent({
          track: removed,
          isNowPlaying: nowPlaying?.id === removed.id,
          removedBy: userId,
        }),
      );
    }

    return removed?.id || null;
  }
}
