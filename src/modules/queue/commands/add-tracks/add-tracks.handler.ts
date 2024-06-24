import { ValidateParams } from "@common/decorators";
import { MediaSource } from "@media-source/entities";
import { MediaSourceService } from "@media-source/services";
import { BadRequestException, ForbiddenException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistMediaSourceRepository, PlaylistRepository } from "@playlist/repositories";
import { MAX_QUEUE_TRACKS } from "@queue/queue.constants";
import { QueueRepository } from "@queue/repositories";
import { ISpotifyProvider } from "@spotify/providers";
import { SPOTIFY_PROVIDER } from "@spotify/spotify.constants";
import { UserLikeMediaSourceRepository } from "@user/repositories";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";

import { AddTracksCommand, AddTracksParamSchema, AddTracksResult } from "./add-tracks.command";

@CommandHandler(AddTracksCommand)
export class AddTracksHandler implements IInferredCommandHandler<AddTracksCommand> {
  constructor(
    private readonly mediaSourceService: MediaSourceService,
    private readonly queueRepository: QueueRepository,
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistVideoRepository: PlaylistMediaSourceRepository,
    private readonly userLikeRepository: UserLikeMediaSourceRepository,
    @Inject(YOUTUBEI_PROVIDER)
    private readonly youtubeProvider: IYoutubeiProvider,
    @Inject(SPOTIFY_PROVIDER)
    private readonly spotifyProvider: ISpotifyProvider,
  ) {}

  @ValidateParams(AddTracksParamSchema)
  public async execute(params: AddTracksCommand): Promise<AddTracksResult> {
    const {
      mediaSourceId,
      mediaSourceIds,
      youtubeKeyword,
      playlistId,
      youtubePlaylistId,
      spotifyPlaylistId,
      spotifyAlbumId,
      lastLikedCount,
      allowDuplicates,
      executor,
      voiceChannelId,
    } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");

    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const limit = MAX_QUEUE_TRACKS - queue.tracks.length; // early checking
    if (limit <= 0) throw new BadRequestException("Queue is full");

    let sources: MediaSource[] = [];

    if (mediaSourceId || youtubeKeyword) {
      const mediaSource = await this.mediaSourceService.getSource({
        mediaSourceId,
        youtubeKeyword,
      });
      if (mediaSource) sources.push(mediaSource);
    } else if (mediaSourceIds) {
      sources = await this.mediaSourceService.getStoredSources(mediaSourceIds);
    } else if (playlistId) {
      const playlist = await this.playlistRepository.getById(playlistId);
      if (!playlist) throw new NotFoundException("Playlist not found");
      if (playlist?.ownerId !== executor.id) throw new ForbiddenException("Missing permissions");

      const playlistVideos = await this.playlistVideoRepository.getByPlaylistId(playlist.id, {
        limit,
      });
      sources = playlistVideos.map((pv) => pv.mediaSource!);
    } else if (youtubePlaylistId) {
      const videos = await this.youtubeProvider.getPlaylistVideos(youtubePlaylistId);
      sources = videos.map((v) => MediaSource.fromYoutube(v));
    } else if (spotifyPlaylistId) {
      const playlist = await this.spotifyProvider.getPlaylist(spotifyPlaylistId);
      if (playlist) sources = playlist.tracks.map((t) => MediaSource.fromSpotify(t));
    } else if (spotifyAlbumId) {
      const album = await this.spotifyProvider.getAlbum(spotifyAlbumId);
      if (album) sources = album.tracks.map((t) => MediaSource.fromSpotify(t));
    } else if (lastLikedCount) {
      const likedVideos = await this.userLikeRepository.getByUserId(executor.id, {
        limit: Math.min(limit, lastLikedCount),
      });
      sources = likedVideos.map((v) => v.mediaSource!);
    }

    if (!sources.length) throw new BadRequestException("No tracks found");

    const tracks = queue.addTracks(sources, !!allowDuplicates, member);

    return tracks.map((t) => t.id);
  }
}
