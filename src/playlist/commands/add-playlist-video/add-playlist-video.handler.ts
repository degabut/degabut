import { ValidateParams } from "@common/decorators";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistVideo } from "@playlist/entities";
import { MAX_VIDEO_PER_PLAYLIST } from "@playlist/playlist.constant";
import { PlaylistRepository, PlaylistVideoRepository } from "@playlist/repositories";
import { YoutubeCachedService } from "@youtube/services";

import {
  AddPlaylistVideoCommand,
  AddPlaylistVideoParamSchema,
  AddPlaylistVideoResult,
} from "./add-playlist-video.command";

@CommandHandler(AddPlaylistVideoCommand)
export class AddPlaylistVideoHandler implements IInferredCommandHandler<AddPlaylistVideoCommand> {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistVideoRepository: PlaylistVideoRepository,
    private readonly youtubeService: YoutubeCachedService,
  ) {}

  @ValidateParams(AddPlaylistVideoParamSchema)
  public async execute(params: AddPlaylistVideoCommand): Promise<AddPlaylistVideoResult> {
    const { videoId, playlistId, executor } = params;

    const playlist = await this.playlistRepository.getById(playlistId);
    if (playlist?.ownerId !== executor.id) throw new ForbiddenException("No permission");

    const count = await this.playlistVideoRepository.getCountByPlaylistId(playlistId);
    if (count >= MAX_VIDEO_PER_PLAYLIST) {
      throw new BadRequestException("Playlist video limit reached");
    }

    const video = await this.youtubeService.getVideo(videoId);
    if (!video) throw new BadRequestException("Video not found");

    const playlistVideo = new PlaylistVideo({
      videoId: video.id,
      playlistId,
      video,
      createdBy: executor.id,
    });

    playlist.videoCount = count + 1;

    await Promise.all([
      this.playlistRepository.update(playlist),
      this.playlistVideoRepository.insert(playlistVideo),
    ]);

    return playlistVideo.id;
  }
}
