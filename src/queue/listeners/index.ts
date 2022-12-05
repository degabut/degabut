import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { PlayerChannelChangedListener } from "./player-channel-changed.listener";
import { PlayerDestroyedListener } from "./player-destroyed.listener";
import { PlayerReadyListener } from "./player-ready.listener";
import { TrackAudioEndedListener } from "./track-audio-ended.listener";
import { TrackAudioStartedListener } from "./track-audio-started.listener";
import { TrackLoadFailedListener } from "./track-load-failed.listener";
import { VoiceMemberJoinedListener } from "./voice-member-joined.listener";
import { VoiceMemberLeftListener } from "./voice-member-left.listener";
import { VoiceMemberUpdatedListener } from "./voice-member-updated.listener";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAudioStartedListener,
  TrackAudioEndedListener,
  TrackLoadFailedListener,
  PlayerReadyListener,
  PlayerDestroyedListener,
  PlayerChannelChangedListener,
  VoiceMemberJoinedListener,
  VoiceMemberLeftListener,
  VoiceMemberUpdatedListener,
];
