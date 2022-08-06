import { TrackEndedHandler } from "./track-ended.handler";
import { TrackStartedHandler } from "./track-started.handler";
import { VoiceDestroyedHandler } from "./voice-destroyed.handler";
import { VoiceReadyHandler } from "./voice-ready.handler";

export const Listeners = [
  TrackStartedHandler,
  TrackEndedHandler,
  VoiceReadyHandler,
  VoiceDestroyedHandler,
];
