import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { Queue, Track } from "@queue/entities";
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
    const removed = this.removeTracks(queue, {
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

  private removeTracks(
    queue: Queue,
    { trackIds, memberId }: { memberId?: string; trackIds?: string[] },
  ): Track[] {
    let queueTrackIds = queue.tracks.map((t) => t.id);
    const removedTracks: Track[] = [];

    if (trackIds) {
      removedTracks.push(...queue.tracks.filter((t) => trackIds.includes(t.id)));
      queue.tracks = queue.tracks.filter((t) => !trackIds.includes(t.id));
    }

    if (memberId) {
      removedTracks.push(...queue.tracks.filter((t) => t.requestedBy?.id === memberId));
      queue.tracks = queue.tracks.filter((t) => t.requestedBy?.id !== memberId);
    }

    const nowPlayingId = queue.nowPlaying?.id;
    const hasNowPlaying = removedTracks.some((t) => t.id === nowPlayingId);

    if (!removedTracks.length || queue.shuffle || !hasNowPlaying) {
      return removedTracks;
    }

    queueTrackIds = queueTrackIds.filter(
      (id) => removedTracks.some((t) => t.id === id) || id === nowPlayingId,
    );
    const nowPlayingIndex = queueTrackIds.findIndex((id) => id === nowPlayingId);
    queue.nextTrack = queue.tracks[nowPlayingIndex] || null;

    return removedTracks;
  }
}
