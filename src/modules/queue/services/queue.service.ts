import { ArrayUtil, RandomUtil } from "@common/utils";
import { BadRequestException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { LoopMode, Queue, Track } from "@queue/entities";
import { QueueProcessedEvent, TrackRemovedEvent } from "@queue/events";

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
      if (queue.loopMode === LoopMode.Track) {
        nextIndex = Math.max(nowPlayingIndex, 0);
      } else if (queue.shuffle) {
        nextIndex = this.getShuffledTrackIndex(queue);
      } else if (queue.loopMode === LoopMode.Queue) {
        nextIndex = nowPlayingIndex + 1;
      } else {
        nextIndex = nowPlayingIndex;
      }
    }

    queue.nowPlaying = queue.tracks.at(nextIndex) || queue.tracks.at(0) || null;

    this.eventBus.publish(new QueueProcessedEvent({ queue }));
  }

  private getShuffledTrackIndex(queue: Queue): number {
    const unplayedTracks = queue.unplayedTrack;

    if (!unplayedTracks.length) return 0;

    let randomTrack: Track | undefined;

    if (!queue.previousHistoryIds.length) {
      randomTrack = unplayedTracks.at(RandomUtil.randomInt(0, unplayedTracks.length - 1));
    } else {
      const randomTracks = unplayedTracks.sort((a, b) => {
        return (
          queue.previousHistoryIds.findIndex((id) => id === a.id) -
          queue.previousHistoryIds.findIndex((id) => id === b.id)
        );
      });
      randomTrack = ArrayUtil.pickRankedRandom(randomTracks);
    }

    return randomTrack ? queue.tracks.findIndex((t) => t.id === randomTrack?.id) : 0;
  }
}
