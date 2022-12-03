import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { AddTrackHandler } from "./add-track";
import { AddTracksHandler } from "./add-tracks";
import { ChangeLoopModeHandler } from "./change-loop-mode";
import { ChangeTrackOrderHandler } from "./change-track-order";
import { ClearQueueHandler } from "./clear-queue";
import { JamHandler } from "./jam";
import { PlayTrackHandler } from "./play-track";
import { RemoveTrackHandler } from "./remove-track";
import { ToggleShuffleHandler } from "./toggle-shuffle";

export * from "./add-track";
export * from "./add-tracks";
export * from "./change-loop-mode";
export * from "./change-track-order";
export * from "./clear-queue";
export * from "./jam";
export * from "./play-track";
export * from "./remove-track";
export * from "./toggle-shuffle";

export const Commands: Constructor<ICommandHandler>[] = [
  AddTrackHandler,
  AddTracksHandler,
  ChangeLoopModeHandler,
  ChangeTrackOrderHandler,
  ClearQueueHandler,
  PlayTrackHandler,
  JamHandler,
  RemoveTrackHandler,
  ToggleShuffleHandler,
];
