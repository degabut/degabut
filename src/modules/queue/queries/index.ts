import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetNowPlayingLyricsHandler } from "./get-now-playing-lyrics";
import { GetQueueHandler } from "./get-queue";

export * from "./get-now-playing-lyrics";
export * from "./get-queue";

export const Queries: Constructor<IQueryHandler>[] = [GetNowPlayingLyricsHandler, GetQueueHandler];
