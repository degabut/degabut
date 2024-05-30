import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetPlaylistHandler } from "./get-playlist";
import { GetPlaylistMediaSourceHandler } from "./get-playlist-media-sources";
import { GetPlaylistsHandler } from "./get-playlists";

export * from "./get-playlist";
export * from "./get-playlist-media-sources";
export * from "./get-playlists";

export const Queries: Constructor<IQueryHandler>[] = [
  GetPlaylistHandler,
  GetPlaylistsHandler,
  GetPlaylistMediaSourceHandler,
];
