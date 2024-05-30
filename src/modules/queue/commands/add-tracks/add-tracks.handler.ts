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
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";

import { AddTracksCommand, AddTracksParamSchema, AddTracksResult } from "./add-tracks.command";

@CommandHandler(AddTracksCommand)
export class AddTracksHandler implements IInferredCommandHandler<AddTracksCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistVideoRepository: PlaylistMediaSourceRepository,
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
      executor,
      voiceChannelId,
    } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");

    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    let sources: MediaSource[] = [];

    if (playlistId) {
      const playlist = await this.playlistRepository.getById(playlistId);
      if (!playlist) throw new NotFoundException("Playlist not found");
      if (playlist?.ownerId !== executor.id) throw new ForbiddenException("Missing permissions");

      const playlistVideos = await this.playlistVideoRepository.getByPlaylistId(playlist.id, {
        limit: MAX_QUEUE_TRACKS,
        page: 1,
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
    }

    if (!sources.length) throw new BadRequestException("Playlist is empty or not found");

    const tracks = sources.slice(0, MAX_QUEUE_TRACKS - queue.tracks.length).map(
      (source) =>
        new Track({
          queue,
          mediaSource: source,
          requestedBy: member,
        }),
    );

    if (!tracks.length) throw new BadRequestException("Queue is full");

    queue.tracks.push(...tracks);
    this.eventBus.publish(new TracksAddedEvent({ queue, tracks, member }));

    if (!queue.nowPlaying) {
      queue.nextTrack = tracks[0];
      this.queueService.processQueue(queue);
    }

    return tracks.map((t) => t.id);
  }
}
