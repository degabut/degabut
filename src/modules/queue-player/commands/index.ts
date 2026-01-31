import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { CreateHandler } from "./create";
import { RedirectHandler } from "./redirect";
import { SeekHandler } from "./seek";
import { SetFiltersHandler } from "./set-filters";
import { SetPauseHandler } from "./set-pause";
import { SkipHandler } from "./skip";
import { StopHandler } from "./stop";

export * from "./create";
export * from "./redirect";
export * from "./seek";
export * from "./set-filters";
export * from "./set-pause";
export * from "./skip";
export * from "./stop";

export const Commands: Constructor<ICommandHandler>[] = [
  CreateHandler,
  StopHandler,
  SkipHandler,
  SeekHandler,
  SetPauseHandler,
  SetFiltersHandler,
  RedirectHandler,
];
