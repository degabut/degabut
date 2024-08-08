import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { NextTrackAddedListener } from "./next-track-added.listener";
import { QueueClearedListener } from "./queue-cleared.listener";
import { QueueProcessedListener } from "./queue-processed.listener";
import { TrackSkippedListener } from "./track-skipped.listener";
import { TracksAddedListener } from "./tracks-added.listener";
import { TracksRemovedListener } from "./tracks-removed.listener";
import { VoiceChannelChangedListener } from "./voice-channel-changed.listener";

export const Listeners: Constructor<IEventHandler>[] = [
  VoiceChannelChangedListener,
  TracksAddedListener,
  TracksRemovedListener,
  TrackSkippedListener,
  NextTrackAddedListener,
  QueueClearedListener,
  QueueProcessedListener,
];
