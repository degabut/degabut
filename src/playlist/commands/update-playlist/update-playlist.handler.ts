import { ValidateParams } from "@common/decorators";
import { ForbiddenException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistRepository } from "@playlist/repositories";

import {
  UpdatePlaylistCommand,
  UpdatePlaylistParamSchema,
  UpdatePlaylistResult,
} from "./update-playlist.command";

@CommandHandler(UpdatePlaylistCommand)
export class UpdatePlaylistHandler implements IInferredCommandHandler<UpdatePlaylistCommand> {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  @ValidateParams(UpdatePlaylistParamSchema)
  public async execute(params: UpdatePlaylistCommand): Promise<UpdatePlaylistResult> {
    const { playlistId, name, executor } = params;

    const playlist = await this.playlistRepository.getById(playlistId);
    if (playlist?.ownerId !== executor.id) throw new ForbiddenException("No permission");

    playlist.name = name;

    await this.playlistRepository.update(playlist);

    return playlist.id;
  }
}
