import { QueuePausedHandler } from "./queue-paused.handler";
import { QueueProcessedHandler } from "./queue-processed.handler";
import { TrackAddedHandler } from "./track-added.handler";
import { TrackRemovedHandler } from "./track-removed.handler";
import { TrackSkippedHandler } from "./track-skipped.handler";
import { TrackStartedHandler } from "./track-started.handler";

export const Listeners = [
  TrackAddedHandler,
  TrackRemovedHandler,
  TrackSkippedHandler,
  TrackStartedHandler,
  QueueProcessedHandler,
  QueuePausedHandler,
];
