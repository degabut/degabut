import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetLastPlayedHandler } from "./get-last-played";
import { GetMostPlayedHandler } from "./get-most-played";
import { IsVideosLikedHandler } from "./is-videos-liked";

export * from "./get-last-played";
export * from "./get-most-played";
export * from "./is-videos-liked";

export const Queries: Constructor<IQueryHandler>[] = [
  GetLastPlayedHandler,
  GetMostPlayedHandler,
  IsVideosLikedHandler,
];
