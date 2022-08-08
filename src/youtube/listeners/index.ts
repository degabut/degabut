import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { TrackAudioEndedHandler } from "./track-audio-ended.handler";
import { TrackAudioStartedHandler } from "./track-audio-started.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  TrackAudioStartedHandler,
  TrackAudioEndedHandler,
];
