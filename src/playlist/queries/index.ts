import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetPlaylistHandler } from "./get-playlist";
import { GetPlaylistVideosHandler } from "./get-playlist-videos";
import { GetPlaylistsHandler } from "./get-playlists";

export * from "./get-playlist";
export * from "./get-playlist-videos";
export * from "./get-playlists";

export const Queries: Constructor<IQueryHandler>[] = [
  GetPlaylistHandler,
  GetPlaylistsHandler,
  GetPlaylistVideosHandler,
];
