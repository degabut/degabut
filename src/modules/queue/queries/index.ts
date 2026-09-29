import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetJoinableQueuesHandler } from "./get-joinable-queues";
import { GetNowPlayingLyricsHandler } from "./get-now-playing-lyrics";
import { GetQueueHandler } from "./get-queue";
import { GetQueuesHandler } from "./get-queues";

export * from "./get-joinable-queues";
export * from "./get-now-playing-lyrics";
export * from "./get-queue";
export * from "./get-queues";

export const Queries: Constructor<IQueryHandler>[] = [
  GetJoinableQueuesHandler,
  GetNowPlayingLyricsHandler,
  GetQueueHandler,
  GetQueuesHandler,
];
