import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetVideoHandler } from "./get-video/get-video.handler";
import { SearchPlaylistHandler } from "./search-playlist";
import { SearchVideoHandler } from "./search-video/search-video.handler";

export * from "./get-video";
export * from "./search-playlist";
export * from "./search-video";

export const Queries: Constructor<IQueryHandler>[] = [
  SearchVideoHandler,
  GetVideoHandler,
  SearchPlaylistHandler,
];
