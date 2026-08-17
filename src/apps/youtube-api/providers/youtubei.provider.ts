import { Inject, Injectable } from "@nestjs/common";
import { YoutubeApiConfigService } from "@youtube-api/config";
import { YoutubeiUtil } from "@youtube/providers";
import { YoutubeCachedService } from "@youtube/services";
import {
  LiveVideo,
  MixPlaylist,
  Playlist,
  PlaylistCompact,
  PlaylistVideos,
  Video,
  VideoCompact,
  Client as YoutubeiClient,
} from "youtubei";

@Injectable()
export class YoutubeiProvider {
  private readonly youtubeClient: YoutubeiClient;
  private readonly cacheAll: boolean;

  constructor(
    @Inject(YoutubeApiConfigService) config: YoutubeApiConfigService,
    private readonly youtubeService: YoutubeCachedService,
  ) {
    this.cacheAll = config.cacheAll;
    this.youtubeClient = new YoutubeiClient({
      oauth: config.refreshToken
        ? {
            enabled: true,
            refreshToken: config.refreshToken,
          }
        : undefined,
    });
  }

  public async search(keyword: string): Promise<(VideoCompact | PlaylistCompact)[]> {
    const result = await this.youtubeClient.search(keyword);
    const items = result.items.filter(
      (r): r is VideoCompact | PlaylistCompact =>
        r instanceof VideoCompact || r instanceof PlaylistCompact,
    );
    await this.cacheVideos(items.filter((r): r is VideoCompact => r instanceof VideoCompact));
    return items;
  }

  public async searchPlaylist(keyword: string): Promise<PlaylistCompact[]> {
    const playlist = await this.youtubeClient.search(keyword, { type: "playlist" });
    return playlist.items.filter((p) => p instanceof PlaylistCompact);
  }

  public async searchVideo(keyword: string): Promise<VideoCompact[]> {
    const videos = await this.youtubeClient.search(keyword, { type: "video" });
    const items = videos.items.filter((v) => v instanceof VideoCompact);
    await this.cacheVideos(items);
    return items;
  }

  public async getVideo(id: string): Promise<Video | LiveVideo | undefined> {
    const video = await this.youtubeClient.getVideo(id);
    if (!video) return;

    video.related.items = video.related.items.filter((r) => r instanceof VideoCompact);
    await this.cacheVideos([video]);
    return video;
  }

  public async getPlaylist(id: string): Promise<MixPlaylist | Playlist | undefined> {
    const playlist = await this.youtubeClient.getPlaylist(id);
    return playlist;
  }

  public async getPlaylistVideosContinuation(token: string): Promise<PlaylistVideos> {
    const playlistVideos = new PlaylistVideos({
      client: this.youtubeClient,
      playlist: new Playlist({ client: this.youtubeClient }),
    });
    playlistVideos.continuation = token;
    await playlistVideos.next();

    await this.cacheVideos(playlistVideos.items);
    return playlistVideos;
  }

  private async cacheVideos(videos: (Video | VideoCompact | LiveVideo)[]): Promise<void> {
    if (!this.cacheAll || !this.youtubeService || !videos.length) return;

    const parsedVideos = videos
      .map((v) => {
        if (v instanceof VideoCompact) return YoutubeiUtil.videoCompactToEntity(v);
        else {
          const entity = YoutubeiUtil.videoToEntity(v);
          return [YoutubeiUtil.videoCompactToEntity(entity), ...entity.related];
        }
      })
      .flat();

    await this.youtubeService.cacheVideo(parsedVideos, { ignoreEmbedFetch: true, newOnly: true });
  }
}
