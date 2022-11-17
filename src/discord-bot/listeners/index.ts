import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { QueuePauseStateChangedHandler } from "./queue-pause-state-changed.handler";
import { QueueProcessedHandler } from "./queue-processed.handler";
import { TrackAddedHandler } from "./track-added.handler";
import { TrackMarkedPlayNextHandler } from "./track-marked-play-next.handler";
import { TrackRemovedHandler } from "./track-removed.handler";
import { TrackSkippedHandler } from "./track-skipped.handler";
import { TracksAddedHandler } from "./tracks-added.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAddedHandler,
  TracksAddedHandler,
  TrackRemovedHandler,
  TrackSkippedHandler,
  TrackMarkedPlayNextHandler,
  QueueProcessedHandler,
  QueuePauseStateChangedHandler,
];
