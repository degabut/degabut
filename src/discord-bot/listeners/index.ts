import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { QueuePausedHandler } from "./queue-paused.handler";
import { QueueProcessedHandler } from "./queue-processed.handler";
import { TrackAddedHandler } from "./track-added.handler";
import { TrackAudioSkippedHandler } from "./track-audio-skipped.handler";
import { TrackAudioStartedHandler } from "./track-audio-started.handler";
import { TrackRemovedHandler } from "./track-removed.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAddedHandler,
  TrackRemovedHandler,
  TrackAudioSkippedHandler,
  TrackAudioStartedHandler,
  QueueProcessedHandler,
  QueuePausedHandler,
];
