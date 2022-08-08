import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetLastPlayedHandler } from "./get-last-played";
import { GetMostPlayedHandler } from "./get-most-played";
import { GetVideoHandler } from "./get-video/get-video.handler";
import { SearchVideoHandler } from "./search-video/search-video.handler";

export * from "./get-last-played";
export * from "./get-most-played";
export * from "./get-video";
export * from "./search-video";

export const Queries: Constructor<IQueryHandler>[] = [
  GetLastPlayedHandler,
  GetMostPlayedHandler,
  SearchVideoHandler,
  GetVideoHandler,
];
