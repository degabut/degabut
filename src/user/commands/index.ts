import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { LikeVideoHandler } from "./like-video";
import { RemovePlayHistoryHandler } from "./remove-play-history";
import { UnlikeVideoHandler } from "./unlike-video";

export * from "./like-video";
export * from "./remove-play-history";
export * from "./unlike-video";

export const Commands: Constructor<ICommandHandler>[] = [
  RemovePlayHistoryHandler,
  LikeVideoHandler,
  UnlikeVideoHandler,
];
