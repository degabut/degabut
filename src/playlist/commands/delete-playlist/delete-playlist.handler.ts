import { ValidateParams } from "@common/decorators";
import { ForbiddenException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistRepository, PlaylistVideoRepository } from "@playlist/repositories";

import {
  DeletePlaylistCommand,
  DeletePlaylistParamSchema,
  DeletePlaylistResult,
} from "./delete-playlist.command";

@CommandHandler(DeletePlaylistCommand)
export class DeletePlaylistHandler implements IInferredCommandHandler<DeletePlaylistCommand> {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistVideoRepository: PlaylistVideoRepository,
  ) {}

  @ValidateParams(DeletePlaylistParamSchema)
  public async execute(params: DeletePlaylistCommand): Promise<DeletePlaylistResult> {
    const { playlistId, executor } = params;

    const playlist = await this.playlistRepository.getById(playlistId);
    if (playlist?.ownerId !== executor.id) throw new ForbiddenException("No permission");

    await Promise.all([
      this.playlistRepository.delete(playlist),
      this.playlistVideoRepository.deleteByPlaylistId(playlist.id),
    ]);
  }
}
