import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { QueuePausedHandler } from "./queue-paused.handler";
import { QueueProcessedHandler } from "./queue-processed.handler";
import { TrackAddedHandler } from "./track-added.handler";
import { TrackRemovedHandler } from "./track-removed.handler";
import { TrackSkippedHandler } from "./track-skipped.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAddedHandler,
  TrackRemovedHandler,
  TrackSkippedHandler,
  QueueProcessedHandler,
  QueuePausedHandler,
];
