import { ValidateParams } from "@common/decorators";
import { ForbiddenException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistMediaSourceRepository, PlaylistRepository } from "@playlist/repositories";

import {
  DeletePlaylistCommand,
  DeletePlaylistParamSchema,
  DeletePlaylistResult,
} from "./delete-playlist.command";

@CommandHandler(DeletePlaylistCommand)
export class DeletePlaylistHandler implements IInferredCommandHandler<DeletePlaylistCommand> {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistMediaSourceRepository: PlaylistMediaSourceRepository,
  ) {}

  @ValidateParams(DeletePlaylistParamSchema)
  public async execute(params: DeletePlaylistCommand): Promise<DeletePlaylistResult> {
    const { playlistId, executor } = params;

    const playlist = await this.playlistRepository.getById(playlistId);
    if (playlist?.ownerId !== executor.id) throw new ForbiddenException("No permission");

    await this.playlistMediaSourceRepository.deleteByPlaylistId(playlist.id);
    await this.playlistRepository.delete(playlist);
  }
}
