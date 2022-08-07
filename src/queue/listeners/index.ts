import { TrackAudioEndedHandler } from "./track-audio-ended.handler";
import { TrackAudioStartedHandler } from "./track-audio-started.handler";
import { VoiceDestroyedHandler } from "./voice-destroyed.handler";
import { VoiceReadyHandler } from "./voice-ready.handler";

export const Listeners = [
  TrackAudioStartedHandler,
  TrackAudioEndedHandler,
  VoiceReadyHandler,
  VoiceDestroyedHandler,
];
