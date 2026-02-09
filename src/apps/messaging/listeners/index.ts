import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { PlayerFiltersChangedListener } from "./player-filters-changed.listener";
import { PlayerPauseStateChangedListener } from "./player-pause-state-changed.listener";
import { QueueDestroyedListener } from "./queue-destroyed.listener";
import { TrackSeekedListener } from "./track-seeked.listener";
import { TrackSkippedListener } from "./track-skipped.listener";
import { TrackListener } from "./track.listener";

export const Listeners: Constructor<IEventHandler>[] = [
  PlayerPauseStateChangedListener,
  PlayerFiltersChangedListener,
  QueueDestroyedListener,
  TrackSkippedListener,
  TrackListener,
  TrackSeekedListener,
];
