import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetNowPlayingLyricsHandler } from "./get-now-playing-lyrics";
import { GetQueueHandler } from "./get-queue";
import { GetQueuesHandler } from "./get-queues";

export * from "./get-now-playing-lyrics";
export * from "./get-queue";
export * from "./get-queues";

export const Queries: Constructor<IQueryHandler>[] = [
  GetNowPlayingLyricsHandler,
  GetQueueHandler,
  GetQueuesHandler,
];
