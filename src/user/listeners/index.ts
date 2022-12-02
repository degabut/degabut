import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { TrackAudioFinishedListener } from "./track-audio-finished.listener";

export const Listeners: Constructor<IEventHandler>[] = [TrackAudioFinishedListener];
