import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { LikeMediaSourceHandler } from "./like-media-source";
import { RemovePlayHistoryHandler } from "./remove-play-history";
import { UnlikeMediaSourceHandler } from "./unlike-media-source";

export * from "./like-media-source";
export * from "./remove-play-history";
export * from "./unlike-media-source";

export const Commands: Constructor<ICommandHandler>[] = [
  RemovePlayHistoryHandler,
  LikeMediaSourceHandler,
  UnlikeMediaSourceHandler,
];
