import { ValidateParams } from "@common/decorators";
import { MediaSource } from "@media-source/entities";
import { BadRequestException, ForbiddenException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistMediaSourceRepository, PlaylistRepository } from "@playlist/repositories";
import { Track } from "@queue/entities";
import { TracksAddedEvent } from "@queue/events";
import { MAX_QUEUE_TRACKS } from "@queue/queue.constants";
import { QueueRepository } from "@queue/repositories";
import { QueueService } from "@queue/services";
import { ISpotifyProvider } from "@spotify/providers";
import { SPOTIFY_PROVIDER } from "@spotify/spotify.constants";
import { UserLikeMediaSourceRepository } from "@user/repositories";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";

import { AddTracksCommand, AddTracksParamSchema, AddTracksResult } from "./add-tracks.command";

@CommandHandler(AddTracksCommand)
export class AddTracksHandler implements IInferredCommandHandler<AddTracksCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistVideoRepository: PlaylistMediaSourceRepository,
    private readonly userLikeRepository: UserLikeMediaSourceRepository,
    private readonly queueService: QueueService,
    @Inject(YOUTUBEI_PROVIDER)
    private readonly youtubeProvider: IYoutubeiProvider,
    @Inject(SPOTIFY_PROVIDER)
    private readonly spotifyProvider: ISpotifyProvider,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(AddTracksParamSchema)
  public async execute(params: AddTracksCommand): Promise<AddTracksResult> {
    const {
      playlistId,
      youtubePlaylistId,
      spotifyPlaylistId,
      spotifyAlbumId,
      lastLikedCount,
      executor,
      voiceChannelId,
    } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");

    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    let sources: MediaSource[] = [];

    let limit = MAX_QUEUE_TRACKS - queue.tracks.length; // early checking
    if (limit <= 0) throw new BadRequestException("Queue is full");

    if (playlistId) {
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
        limit,
      });
      sources = likedVideos.map((v) => v.mediaSource!);
    }

    if (!sources.length) throw new BadRequestException("No tracks found");

    limit = MAX_QUEUE_TRACKS - queue.tracks.length; // recalculate, in case there's any changes when fetching the data
    if (limit <= 0) throw new BadRequestException("Queue is full");

    const tracks = sources.slice(0, limit).map(
      (source) =>
        new Track({
          queue,
          mediaSource: source,
          requestedBy: member,
        }),
    );

    queue.tracks.push(...tracks);
    this.eventBus.publish(new TracksAddedEvent({ queue, tracks, member }));

    return tracks.map((t) => t.id);
  }
}
