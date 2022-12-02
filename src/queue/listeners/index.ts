import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { PlayerChannelChangedHandler } from "./player-channel-changed.handler";
import { PlayerDestroyedHandler } from "./player-destroyed.handler";
import { PlayerReadyHandler } from "./player-ready.handler";
import { TrackAudioEndedHandler } from "./track-audio-ended.handler";
import { TrackAudioStartedHandler } from "./track-audio-started.handler";
import { VoiceMemberJoinedHandler } from "./voice-member-joined.handler";
import { VoiceMemberLeftHandler } from "./voice-member-left.handler";
import { VoiceMemberUpdatedHandler } from "./voice-member-updated.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAudioStartedHandler,
  TrackAudioEndedHandler,
  PlayerReadyHandler,
  PlayerDestroyedHandler,
  PlayerChannelChangedHandler,
  VoiceMemberJoinedHandler,
  VoiceMemberLeftHandler,
  VoiceMemberUpdatedHandler,
];
