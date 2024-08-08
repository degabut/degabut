import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { PlayerDestroyedListener } from "./player-destroyed.listener";
import { PlayerReadyListener } from "./player-ready.listener";
import { PlayerTextChannelChangedListener } from "./player-text-channel-changed.listener";
import { PlayerVoiceChannelChangedListener } from "./player-voice-channel-changed.listener";
import { TrackAudioEndedListener } from "./track-audio-ended.listener";
import { TrackAudioStartedListener } from "./track-audio-started.listener";
import { TrackLoadFailedListener } from "./track-load-failed.listener";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAudioStartedListener,
  TrackAudioEndedListener,
  TrackLoadFailedListener,
  PlayerReadyListener,
  PlayerDestroyedListener,
  PlayerVoiceChannelChangedListener,
  PlayerTextChannelChangedListener,
];
