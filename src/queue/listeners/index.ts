import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { TrackAudioEndedHandler } from "./track-audio-ended.handler";
import { TrackAudioStartedHandler } from "./track-audio-started.handler";
import { VoiceDestroyedHandler } from "./voice-destroyed.handler";
import { VoiceMemberJoinedHandler } from "./voice-member-joined.handler";
import { VoiceMemberLeftHandler } from "./voice-member-left.handler";
import { VoiceReadyHandler } from "./voice-ready.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAudioStartedHandler,
  TrackAudioEndedHandler,
  VoiceReadyHandler,
  VoiceDestroyedHandler,
  VoiceMemberJoinedHandler,
  VoiceMemberLeftHandler,
];
