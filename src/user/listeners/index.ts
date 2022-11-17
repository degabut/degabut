import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { TrackAudioFinishedHandler } from "./track-audio-finished.handler";

export const Listeners: Constructor<IEventHandler>[] = [TrackAudioFinishedHandler];
