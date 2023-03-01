import { IButtonInteraction } from "@discord-bot/interfaces";
import { Constructor } from "@nestjs/cqrs";

import { AddTrackButtonInteraction } from "./add-track.button-interaction";
import { PlayTrackButtonInteraction } from "./play-track.button-interaction";
import { RemoveTrackButtonInteraction } from "./remove-track.button-interaction";
import { SkipButtonInteraction } from "./skip.button-interaction copy";

export * from "./add-track.button-interaction";
export * from "./remove-track.button-interaction";

export const Interactions: Constructor<IButtonInteraction>[] = [
  AddTrackButtonInteraction,
  PlayTrackButtonInteraction,
  RemoveTrackButtonInteraction,
  SkipButtonInteraction,
];
