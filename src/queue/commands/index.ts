import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { AddTrackHandler } from "./add-track";
import { ChangeLoopTypeHandler } from "./change-loop-type";
import { ChangeTrackOrderHandler } from "./change-track-order";
import { ClearQueueHandler } from "./clear-queue";
import { PlayTrackHandler } from "./play-track";
import { RemoveTrackHandler } from "./remove-track";
import { SetPauseHandler } from "./set-pause";
import { SkipHandler } from "./skip";
import { ToggleAutoplayHandler } from "./toggle-autoplay";
import { ToggleShuffleHandler } from "./toggle-shuffle";

export * from "./add-track";
export * from "./change-loop-type";
export * from "./change-track-order";
export * from "./clear-queue";
export * from "./play-track";
export * from "./remove-track";
export * from "./set-pause";
export * from "./skip";
export * from "./toggle-autoplay";
export * from "./toggle-shuffle";

export const Commands: Constructor<ICommandHandler>[] = [
  AddTrackHandler,
  ChangeLoopTypeHandler,
  ChangeTrackOrderHandler,
  ClearQueueHandler,
  PlayTrackHandler,
  RemoveTrackHandler,
  SetPauseHandler,
  SkipHandler,
  ToggleAutoplayHandler,
  ToggleShuffleHandler,
];
