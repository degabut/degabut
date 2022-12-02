import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { ChannelChangedListener } from "./channel-changed.listener";
import { QueueProcessedListener } from "./queue-processed.listener";
import { TrackAddedListener } from "./track-added.listener";
import { TrackMarkedPlayNextListener } from "./track-marked-play-next.listener";
import { TrackRemovedListener } from "./track-removed.listener";
import { TrackSkippedListener } from "./track-skipped.listener";
import { TracksAddedListener } from "./tracks-added.listener";

export const Listeners: Constructor<IEventHandler>[] = [
  ChannelChangedListener,
  TrackAddedListener,
  TracksAddedListener,
  TrackRemovedListener,
  TrackSkippedListener,
  TrackMarkedPlayNextListener,
  QueueProcessedListener,
];
