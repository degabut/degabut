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
    return this.mediaSourceRepository.getByIds(mediaSourceIds);
  }

  async storeSource(mediaSource: MediaSource): Promise<void> {
    if (mediaSource.youtubeVideo) await this.youtubeService.cacheVideo(mediaSource.youtubeVideo);
    if (mediaSource.spotifyTrack) await this.spotifyService.cacheTrack(mediaSource.spotifyTrack);
    await this.mediaSourceRepository.upsert(mediaSource);
  }
}
