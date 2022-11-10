import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistRepository, PlaylistVideoRepository } from "@playlist/repositories";
import { YoutubeiProvider } from "@youtube/providers";
import { VideoRepository } from "@youtube/repositories";

import {
  RemovePlaylistVideoCommand,
  RemovePlaylistVideoParamSchema,
  RemovePlaylistVideoResult,
} from "./remove-playlist-video.command";

@CommandHandler(RemovePlaylistVideoCommand)
export class RemovePlaylistVideoHandler
  implements IInferredCommandHandler<RemovePlaylistVideoCommand>
{
  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistVideoRepository: PlaylistVideoRepository,
    private readonly youtubeProvider: YoutubeiProvider,
  ) {}

  @ValidateParams(RemovePlaylistVideoParamSchema)
  public async execute(params: RemovePlaylistVideoCommand): Promise<RemovePlaylistVideoResult> {
    const { playlistVideoId, playlistId, executor } = params;

    const playlist = await this.playlistRepository.getById(playlistId);
    if (playlist?.ownerId !== executor.id) throw new ForbiddenException("No permission");

    const playlistVideo = await this.playlistVideoRepository.getById(playlistVideoId);
    if (!playlistVideo) throw new NotFoundException("Playlist video not found");

    const count = await this.playlistVideoRepository.getCountByPlaylistId(playlistId);
    playlist.videoCount = count - 1;

    await Promise.all([
      this.playlistRepository.update(playlist),
      this.playlistVideoRepository.deleteById(playlistVideoId),
    ]);
  }
}
