import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { QueueClearedListener } from "./queue-cleared.listener";
import { QueueProcessedListener } from "./queue-processed.listener";
import { TrackMarkedPlayNextListener } from "./track-marked-play-next.listener";
import { TrackRemovedListener } from "./track-removed.listener";
import { TrackSkippedListener } from "./track-skipped.listener";
import { TracksAddedListener } from "./tracks-added.listener";
import { TracksRemovedListener } from "./tracks-removed.listener";
import { VoiceChannelChangedListener } from "./voice-channel-changed.listener";

export const Listeners: Constructor<IEventHandler>[] = [
  VoiceChannelChangedListener,
  TracksAddedListener,
  TrackRemovedListener,
  TracksRemovedListener,
  TrackSkippedListener,
  TrackMarkedPlayNextListener,
  QueueClearedListener,
  QueueProcessedListener,
];
