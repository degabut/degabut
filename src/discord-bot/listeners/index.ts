import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { QueueProcessedHandler } from "./queue-processed.handler";
import { TrackAddedHandler } from "./track-added.handler";
import { TrackMarkedPlayNextHandler } from "./track-marked-play-next.handler";
import { TrackRemovedHandler } from "./track-removed.handler";
import { TrackSkippedHandler } from "./track-skipped.handler";
import { TracksAddedHandler } from "./tracks-added.handler";
import { VoiceChangedEvent } from "./voice-changed.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAddedHandler,
  TracksAddedHandler,
  TrackRemovedHandler,
  TrackSkippedHandler,
  TrackMarkedPlayNextHandler,
  QueueProcessedHandler,
  VoiceChangedEvent,
];
