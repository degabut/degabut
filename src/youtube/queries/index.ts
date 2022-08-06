import { GetLastPlayedHandler } from "./get-last-played";
import { GetMostPlayedHandler } from "./get-most-played";
import { GetVideoHandler } from "./get-video/get-video.handler";
import { SearchVideoHandler } from "./search-video/search-video.handler";

export * from "./get-last-played";
export * from "./get-most-played";
export * from "./get-video";
export * from "./search-video";

export const Queries = [
  GetLastPlayedHandler,
  GetMostPlayedHandler,
  SearchVideoHandler,
  GetVideoHandler,
];
