import { ArrayUtil, RandomUtil } from "@common/utils";
import { BadRequestException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { LoopMode, Queue, Track } from "@queue/entities";
import { TrackRemovedEvent } from "@queue/events";
import { QueueProcessedEvent } from "@queue/events/queue-processed.event";

@Injectable()
export class QueueService {
  constructor(private readonly eventBus: EventBus) {}

  public removeTrack(queue: Queue, opts: number | string | boolean): Track | null {
    let index: number;
    if (typeof opts === "number") index = opts;
    else if (typeof opts === "string") index = queue.tracks.findIndex((track) => track.id === opts);
    else if (opts) index = queue.tracks.findIndex((track) => track.id === queue.nowPlaying?.id);
    else throw new BadRequestException("Invalid remove track options");

    const removed = queue.tracks[index];
    if (!removed) return null;

    if (removed.id === queue.nowPlaying?.id && !queue.shuffle) {
      queue.nextTrack = queue.tracks[index + 1] || null;
    }

    queue.tracks.splice(index, 1);

    return removed;
  }

  public removeTracks(
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

  public processQueue(queue: Queue): void {
    const nowPlayingIndex = queue.tracks.findIndex((t) => t.id === queue.nowPlaying?.id);
    queue.nowPlaying = null;

    if (queue.loopMode === LoopMode.Disabled && nowPlayingIndex >= 0) {
      const removedTrack = queue.tracks[nowPlayingIndex];
      queue.tracks.splice(nowPlayingIndex, 1);

      this.eventBus.publish(
        new TrackRemovedEvent({
          track: removedTrack,
          isNowPlaying: false,
        }),
      );
    }

    let nextIndex = 0;

    if (queue.nextTrack) {
      const index = queue.tracks.findIndex((t) => t.id === queue.nextTrack?.id);
      nextIndex = Math.max(index, 0);
      queue.nextTrack = null;
    } else {
      switch (queue.loopMode) {
        case LoopMode.Track:
          nextIndex = Math.max(nowPlayingIndex, 0);
          break;
        case LoopMode.Queue:
          nextIndex = queue.shuffle ? this.getShuffledTrackIndex(queue) : nowPlayingIndex + 1;
          break;
        default:
          nextIndex = queue.shuffle
            ? RandomUtil.randomInt(0, queue.tracks.length - 1)
            : nowPlayingIndex;
          break;
      }
    }

    queue.nowPlaying = queue.tracks.at(nextIndex) || queue.tracks.at(0) || null;

    this.eventBus.publish(new QueueProcessedEvent({ queue }));
  }

  private getShuffledTrackIndex(queue: Queue): number {
    let unplayedTracks = queue.tracks.filter((t) => !queue.shuffleHistoryIds.includes(t.id));
    if (!unplayedTracks.length) {
      unplayedTracks = queue.tracks;
      queue.previousShuffleHistoryIds = [...queue.shuffleHistoryIds];
      const lastShuffle = queue.shuffleHistoryIds.pop();
      queue.shuffleHistoryIds = [];
      if (lastShuffle) unplayedTracks = unplayedTracks.filter((t) => t.id !== lastShuffle);
    }

    if (!unplayedTracks.length) return 0;

    let randomTrack: Track | undefined;

    if (!queue.previousShuffleHistoryIds.length) {
      randomTrack = unplayedTracks.at(RandomUtil.randomInt(0, unplayedTracks.length - 1));
    } else {
      const randomTracks = unplayedTracks.sort((a, b) => {
        return (
          queue.previousShuffleHistoryIds.findIndex((id) => id === a.id) -
          queue.previousShuffleHistoryIds.findIndex((id) => id === b.id)
        );
      });
      randomTrack = ArrayUtil.pickRankedRandom(randomTracks);
    }

    return randomTrack ? queue.tracks.findIndex((t) => t.id === randomTrack?.id) : 0;
  }
}
