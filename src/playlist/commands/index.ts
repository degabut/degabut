import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { AddPlaylistMediaSourceHandler } from "./add-playlist-media-source";
import { CreatePlaylistHandler } from "./create-playlist";
import { DeletePlaylistHandler } from "./delete-playlist";
import { RemovePlaylistMediaSourceHandler } from "./remove-playlist-media-source";
import { UpdatePlaylistHandler } from "./update-playlist";

export * from "./add-playlist-media-source";
export * from "./create-playlist";
export * from "./delete-playlist";
export * from "./remove-playlist-media-source";
export * from "./update-playlist";

export const Commands: Constructor<ICommandHandler>[] = [
  AddPlaylistMediaSourceHandler,
  CreatePlaylistHandler,
  RemovePlaylistMediaSourceHandler,
  DeletePlaylistHandler,
  UpdatePlaylistHandler,
];
