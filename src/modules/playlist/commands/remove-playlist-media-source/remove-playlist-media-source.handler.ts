import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistMediaSourceRepository, PlaylistRepository } from "@playlist/repositories";

import {
  RemovePlaylistMediaSourceCommand,
  RemovePlaylistMediaSourceParamSchema,
  RemovePlaylistMediaSourceResult,
} from "./remove-playlist-media-source.command";

@CommandHandler(RemovePlaylistMediaSourceCommand)
export class RemovePlaylistMediaSourceHandler
  implements IInferredCommandHandler<RemovePlaylistMediaSourceCommand>
{
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistMediaSourceRepository: PlaylistMediaSourceRepository,
  ) {}

  @ValidateParams(RemovePlaylistMediaSourceParamSchema)
  public async execute(
    params: RemovePlaylistMediaSourceCommand,
  ): Promise<RemovePlaylistMediaSourceResult> {
    const { mediaSourceId, playlistId, executor } = params;

    const playlist = await this.playlistRepository.getById(playlistId);
    if (playlist?.ownerId !== executor.id) throw new ForbiddenException("No permission");

    const playlistMediaSource = await this.playlistMediaSourceRepository.getById(mediaSourceId);
    if (playlistMediaSource?.playlistId !== playlist.id) {
      throw new NotFoundException("Playlist media source not found");
    }

    const [count, [lastMediaSource]] = await Promise.all([
      this.playlistMediaSourceRepository.getCountByPlaylistId(playlistId),
      this.playlistMediaSourceRepository.getByPlaylistId(playlistId, { limit: 1 }),
    ]);

    playlist.mediaSourceCount = count - 1;
    playlist.images = lastMediaSource.mediaSource?.images || [];

    await Promise.all([
      this.playlistRepository.update(playlist),
      this.playlistMediaSourceRepository.deleteById(mediaSourceId),
    ]);
  }
}
