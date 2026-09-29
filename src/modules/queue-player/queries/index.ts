import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetQueuePlayerHandler } from "./get-queue-player";
import { GetQueuePlayerStreamHandler } from "./get-queue-player-stream";

export * from "./get-queue-player";
export * from "./get-queue-player-stream";

export const Queries: Constructor<IQueryHandler>[] = [
  GetQueuePlayerHandler,
  GetQueuePlayerStreamHandler,
];
