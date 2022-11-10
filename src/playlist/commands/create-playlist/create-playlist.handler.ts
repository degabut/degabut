import { ValidateParams } from "@common/decorators";
import { BadRequestException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { Playlist } from "@playlist/entities";
import { MAX_PLAYLISTS_PER_USER } from "@playlist/playlist.constant";
import { PlaylistRepository } from "@playlist/repositories";

import {
  CreatePlaylistCommand,
  CreatePlaylistParamSchema,
  CreatePlaylistResult,
} from "./create-playlist.command";

@CommandHandler(CreatePlaylistCommand)
export class CreatePlaylistHandler implements IInferredCommandHandler<CreatePlaylistCommand> {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  @ValidateParams(CreatePlaylistParamSchema)
  public async execute(params: CreatePlaylistCommand): Promise<CreatePlaylistResult> {
    const { name, executor } = params;

    const count = await this.playlistRepository.getCountByUserId(executor.id);
    if (count > MAX_PLAYLISTS_PER_USER) throw new BadRequestException("Playlist limit reached");

    let playlist = new Playlist({
      name,
      videoCount: 0,
      ownerId: executor.id,
    });

    playlist = await this.playlistRepository.insert(playlist);

    return playlist.id;
  }
}
