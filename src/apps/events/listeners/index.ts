import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { MemberJammedListener } from "./member-jammed.listener";
import { MemberListener } from "./member.listener";
import { PlayerFiltersChangedListener } from "./player-filters-changed.listener";
import { PlayerPauseStateChangedListener } from "./player-pause-state-changed.listener";
import { PlayerTickListener } from "./player-tick.listener";
import { QueueDestroyedListener } from "./queue-destroyed.listener";
import { QueueLoopModeChangedListener } from "./queue-loop-mode-changed.listener";
import { QueueShuffleToggledListener } from "./queue-shuffle-toggled.listener";
import { QueueTextChannelChangedListener } from "./queue-text-channel-changed.listener";
import { QueueVoiceChannelChangedListener } from "./queue-voice-channel-changed.listener";
import { QueueListener } from "./queue.listener";
import { TrackMemberListener } from "./track-member.listener";
import { TrackOrderChangedListener } from "./track-order-changed.listener";
import { TrackSeekedListener } from "./track-seeked.listener";
import { TrackListener } from "./track.listener";
import { TracksMemberListener } from "./tracks-member.listener";
import { VoiceMemberJoinedListener } from "./voice-member-joined.listener";
import { VoiceMemberLeftListener } from "./voice-member-left.listener";

export const Listeners: Constructor<IEventHandler>[] = [
  PlayerTickListener,
  MemberJammedListener,
  MemberListener,
  PlayerPauseStateChangedListener,
  PlayerFiltersChangedListener,
  QueueListener,
  QueueDestroyedListener,
  QueueLoopModeChangedListener,
  QueueShuffleToggledListener,
  QueueTextChannelChangedListener,
  QueueVoiceChannelChangedListener,
  TrackMemberListener,
  TrackOrderChangedListener,
  TrackListener,
  TrackSeekedListener,
  TracksMemberListener,
  VoiceMemberJoinedListener,
  VoiceMemberLeftListener,
];
