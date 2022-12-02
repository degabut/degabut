import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { TrackAudioStartedListener } from "./track-audio-started.listener";

export const Listeners: Constructor<IEventHandler>[] = [TrackAudioStartedListener];
