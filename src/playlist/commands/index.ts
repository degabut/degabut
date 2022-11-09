import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { AddPlaylistVideoHandler } from "./add-playlist-video";
import { CreatePlaylistHandler } from "./create-playlist";
import { DeletePlaylistHandler } from "./delete-playlist";
import { RemovePlaylistVideoHandler } from "./remove-playlist-video";

export * from "./add-playlist-video";
export * from "./create-playlist";
export * from "./delete-playlist";
export * from "./remove-playlist-video";

export const Commands: Constructor<ICommandHandler>[] = [
  AddPlaylistVideoHandler,
  CreatePlaylistHandler,
  RemovePlaylistVideoHandler,
  DeletePlaylistHandler,
];
