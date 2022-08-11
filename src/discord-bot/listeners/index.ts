import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { QueuePauseStateChangedHandler } from "./queue-pause-state-changed.handler";
import { QueueProcessedHandler } from "./queue-processed.handler";
import { TrackAddedHandler } from "./track-added.handler";
import { TrackRemovedHandler } from "./track-removed.handler";
import { TrackSkippedHandler } from "./track-skipped.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAddedHandler,
  TrackRemovedHandler,
  TrackSkippedHandler,
  QueueProcessedHandler,
  QueuePauseStateChangedHandler,
];
