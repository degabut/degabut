import { ValidateParams } from "@common/decorators";
import { MediaSourceService } from "@media-source/services";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistMediaSource } from "@playlist/entities";
import { MAX_ITEM_PER_PLAYLIST } from "@playlist/playlist.constant";
import { PlaylistMediaSourceRepository, PlaylistRepository } from "@playlist/repositories";

import {
  AddPlaylistMediaSourceCommand,
  AddPlaylistMediaSourceParamSchema,
  AddPlaylistMediaSourceResult,
} from "./add-playlist-media-source.command";

@CommandHandler(AddPlaylistMediaSourceCommand)
export class AddPlaylistMediaSourceHandler
  implements IInferredCommandHandler<AddPlaylistMediaSourceCommand>
{
  constructor(
    private readonly mediaSourceService: MediaSourceService,
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistMediaSourceRepository: PlaylistMediaSourceRepository,
  ) {}

  @ValidateParams(AddPlaylistMediaSourceParamSchema)
  public async execute(
    params: AddPlaylistMediaSourceCommand,
  ): Promise<AddPlaylistMediaSourceResult> {
    const { mediaSourceId, playlistId, allowDuplicates, executor } = params;

    const playlist = await this.playlistRepository.getById(playlistId);
    if (playlist?.ownerId !== executor.id) throw new ForbiddenException("No permission");

    const count = await this.playlistMediaSourceRepository.getCountByPlaylistId(playlistId);
    if (count >= MAX_ITEM_PER_PLAYLIST) {
      throw new BadRequestException("Playlist item limit reached");
    }

    if (!allowDuplicates) {
      const isExists = await this.playlistMediaSourceRepository.getByPlaylistAndMediaSourceId(
        playlist.id,
        mediaSourceId,
      );
      if (isExists) throw new BadRequestException("Media source already exists in playlist");
    }

    const source = await this.mediaSourceService.getSource({ mediaSourceId });

    if (!source) throw new BadRequestException("Media source not found");

    const playlistMediaSource = new PlaylistMediaSource({
      mediaSourceId: source.id,
      playlistId: playlist.id,
      createdBy: executor.id,
    });

    playlist.mediaSourceCount = count + 1;
    playlist.images = source.images;

    await Promise.all([
      this.playlistRepository.update(playlist),
      this.playlistMediaSourceRepository.insert(playlistMediaSource),
    ]);

    return playlistMediaSource.id;
  }
}
