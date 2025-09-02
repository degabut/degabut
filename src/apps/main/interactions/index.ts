import { IButtonInteraction } from "@main/interfaces";
import { Provider } from "@nestjs/common";
import { Constructor } from "@nestjs/cqrs";

import { AddTrackButtonInteraction } from "./add-track.button-interaction";
import { MediaSourceSelectInteraction } from "./media-source.select-interaction";
import { PlayTrackButtonInteraction } from "./play-track.button-interaction";
import { RemoveTrackButtonInteraction } from "./remove-track.button-interaction";
import { SkipButtonInteraction } from "./skip.button-interaction copy";

export * from "./add-track.button-interaction";
export * from "./remove-track.button-interaction";

export const ButtonInteractions: Constructor<IButtonInteraction>[] = [
  AddTrackButtonInteraction,
  PlayTrackButtonInteraction,
  RemoveTrackButtonInteraction,
  SkipButtonInteraction,
];

export const Interactions: Provider[] = [MediaSourceSelectInteraction];
