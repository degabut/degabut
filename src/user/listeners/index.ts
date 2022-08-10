import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { TrackAudioEndedHandler } from "./track-audio-ended.handler";

export const Listeners: Constructor<IEventHandler>[] = [TrackAudioEndedHandler];
