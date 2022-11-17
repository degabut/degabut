import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { TrackAudioEndedHandler } from "./track-audio-ended.handler";
import { TrackAudioFinishedHandler } from "./track-audio-finished.handler";
import { TrackAudioStartedHandler } from "./track-audio-started.handler";
import { VoiceChannelChangedHandler } from "./voice-channel-changed.handler";
import { VoiceDestroyedHandler } from "./voice-destroyed.handler";
import { VoiceMemberJoinedHandler } from "./voice-member-joined.handler";
import { VoiceMemberLeftHandler } from "./voice-member-left.handler";
import { VoiceMemberUpdatedHandler } from "./voice-member-updated.handler";
import { VoiceReadyHandler } from "./voice-ready.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAudioStartedHandler,
  TrackAudioEndedHandler,
  TrackAudioFinishedHandler,
  VoiceReadyHandler,
  VoiceDestroyedHandler,
  VoiceMemberJoinedHandler,
  VoiceMemberLeftHandler,
  VoiceMemberUpdatedHandler,
  VoiceChannelChangedHandler,
];
