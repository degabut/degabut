import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { AddNextTrackHandler } from "./add-next-track";
import { AddTracksHandler } from "./add-tracks";
import { ChangeLoopModeHandler } from "./change-loop-mode";
import { ChangeTrackOrderHandler } from "./change-track-order";
import { ClearQueueHandler } from "./clear-queue";
import { JamHandler } from "./jam";
import { RemoveNextTrackHandler } from "./remove-next-track";
import { RemoveTrackHandler } from "./remove-track";
import { RemoveTracksHandler } from "./remove-tracks";
import { ToggleAutoplayHandler } from "./toggle-autoplay";
import { ToggleShuffleHandler } from "./toggle-shuffle";

export * from "./add-next-track";
export * from "./add-tracks";
export * from "./change-loop-mode";
export * from "./change-track-order";
export * from "./clear-queue";
export * from "./jam";
export * from "./remove-track";
export * from "./remove-tracks";
export * from "./toggle-autoplay";
export * from "./toggle-shuffle";

export const Commands: Constructor<ICommandHandler>[] = [
  AddTracksHandler,
  ChangeLoopModeHandler,
  ChangeTrackOrderHandler,
  ClearQueueHandler,
  AddNextTrackHandler,
  RemoveNextTrackHandler,
  JamHandler,
  RemoveTrackHandler,
  RemoveTracksHandler,
  ToggleAutoplayHandler,
  ToggleShuffleHandler,
];
