import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { TrackAudioStartedHandler } from "./track-audio-started.handler";

export const Listeners: Constructor<IEventHandler>[] = [TrackAudioStartedHandler];
