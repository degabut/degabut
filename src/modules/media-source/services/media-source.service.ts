import { MediaSource } from "@media-source/entities";
import { MediaSourceRepository } from "@media-source/repositories";
import { MediaSourceUtil } from "@media-source/utils";
import { Injectable } from "@nestjs/common";
import { SpotifyCachedService } from "@spotify/services";
import { YoutubeCachedService } from "@youtube/services";

type SourceOptions = {
  youtubeKeyword?: string;
  mediaSourceId?: string;
};

@Injectable()
export class MediaSourceService {
  constructor(
    private readonly mediaSourceRepository: MediaSourceRepository,
    private readonly youtubeService: YoutubeCachedService,
    private readonly spotifyService: SpotifyCachedService,
  ) {}

  async getSource(options: SourceOptions): Promise<MediaSource | undefined> {
    const { mediaSourceId, youtubeKeyword } = options;
    const { youtubeVideoId, spotifyTrackId } = MediaSourceUtil.extractSourceId(mediaSourceId);

    let mediaSource: MediaSource | undefined;

    if (youtubeVideoId || spotifyTrackId) {
      mediaSource = await this.mediaSourceRepository.getByContentId({
        youtubeVideoId,
        spotifyTrackId,
      });

      if (mediaSource?.youtubeVideoId)
        mediaSource.youtubeVideo = await this.youtubeService.getVideo(mediaSource.youtubeVideoId);
      if (mediaSource?.spotifyTrackId)
        mediaSource.spotifyTrack = await this.spotifyService.getTrack(mediaSource.spotifyTrackId);
    }

    if (!mediaSource) {
      if (youtubeKeyword) {
        const video = await this.youtubeService.searchOneVideo(youtubeKeyword);
        if (video) mediaSource = MediaSource.fromYoutube(video);
      } else if (youtubeVideoId) {
        const video = await this.youtubeService.getVideo(youtubeVideoId);
        if (video) mediaSource = MediaSource.fromYoutube(video);
      } else if (spotifyTrackId) {
        const track = await this.spotifyService.getTrack(spotifyTrackId);
        if (track) mediaSource = MediaSource.fromSpotify(track);
      }

      if (mediaSource) await this.mediaSourceRepository.upsert(mediaSource);
    }

    return mediaSource;
  }

  async getStoredSources(mediaSourceIds: string[]): Promise<MediaSource[]> {
    const sources = await this.mediaSourceRepository.getByIds(mediaSourceIds);
    const sourcesMap = new Map(sources.map((s) => [s.id, s]));

    const missingIds = [...new Set(mediaSourceIds.filter((id) => !sourcesMap.has(id)))];
    const missingYoutubeIds = missingIds
      .map((id) => MediaSourceUtil.extractSourceId(id).youtubeVideoId)
      .filter((id): id is string => !!id);
    const missingSpotifyIds = missingIds
      .map((id) => MediaSourceUtil.extractSourceId(id).spotifyTrackId)
      .filter((id): id is string => !!id);

    const existingYoutubeIds = sources
      .filter((s) => s.youtubeVideoId)
      .map((s) => s.youtubeVideoId!);
    const existingSpotifyIds = sources
      .filter((s) => s.spotifyTrackId)
      .map((s) => s.spotifyTrackId!);

    const [youtubeVideos, spotifyTracks, missingYoutubeVideos, missingSpotifyTracks] =
      await Promise.all([
        existingYoutubeIds.length ? this.youtubeService.getVideos(existingYoutubeIds, true) : [],
        existingSpotifyIds.length ? this.spotifyService.getTracks(existingSpotifyIds, true) : [],
        missingYoutubeIds.length ? this.youtubeService.getVideos(missingYoutubeIds, true) : [],
        missingSpotifyIds.length ? this.spotifyService.getTracks(missingSpotifyIds, true) : [],
      ]);

    const youtubeMap = new Map(youtubeVideos.map((v) => [v.id, v]));
    const spotifyMap = new Map(spotifyTracks.map((t) => [t.id, t]));

    for (const source of sources) {
      if (source.youtubeVideoId) source.youtubeVideo = youtubeMap.get(source.youtubeVideoId);
      if (source.spotifyTrackId) source.spotifyTrack = spotifyMap.get(source.spotifyTrackId);
    }

    const newSources = [
      ...missingYoutubeVideos.map((v) => MediaSource.fromYoutube(v)),
      ...missingSpotifyTracks.map((t) => MediaSource.fromSpotify(t)),
    ];

    if (newSources.length) await this.mediaSourceRepository.upsert(newSources);

    return [...sources, ...newSources];
  }

  async storeSource(mediaSource: MediaSource): Promise<void> {
    if (mediaSource.youtubeVideo) await this.youtubeService.cacheVideo(mediaSource.youtubeVideo);
    if (mediaSource.spotifyTrack) await this.spotifyService.cacheTrack(mediaSource.spotifyTrack);
    await this.mediaSourceRepository.upsert(mediaSource);
  }
}
