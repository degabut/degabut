import { Injectable } from "@nestjs/common";
import { YoutubeVideo, YoutubeVideoCompact } from "@youtube/entities";
import { YoutubeCachedService } from "@youtube/services/youtube-cached.service";
import { MAX_PLAYLIST_VIDEOS_PAGE } from "@youtube/youtube.constants";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { MixPlaylist, Client as YoutubeiClient } from "youtubei";

import { IYoutubeiProvider } from "./youtubei.interface";
import { YoutubeiUtil } from "./youtubei.util";

type YoutubeiProviderOptions = {
  oauthRefreshToken?: string;
  proxyUrl?: string;
  cacheAll?: boolean;
  youtubeService?: YoutubeCachedService;
};

@Injectable()
export class YoutubeiProvider implements IYoutubeiProvider {
  private readonly youtubeClient: YoutubeiClient;
  private readonly cacheAll: boolean;
  private readonly youtubeService?: YoutubeCachedService;

  constructor(options?: YoutubeiProviderOptions) {
    const { oauthRefreshToken: refreshToken, proxyUrl, cacheAll, youtubeService } = options || {};
    this.cacheAll = cacheAll ?? false;
    this.youtubeService = youtubeService;

    let agent: HttpsProxyAgent<string> | HttpProxyAgent<string> | undefined = undefined;
    if (proxyUrl?.startsWith("https")) {
      agent = new HttpsProxyAgent(proxyUrl);
    } else if (proxyUrl) {
      agent = new HttpProxyAgent(proxyUrl);
    }

    this.youtubeClient = new YoutubeiClient({
      oauth: refreshToken
        ? {
            enabled: true,
            refreshToken,
          }
        : undefined,
      fetchOptions: { agent },
    });
  }

  public async searchVideo(keyword: string): Promise<YoutubeVideoCompact[]> {
    const videos = await this.youtubeClient.search(keyword, { type: "video" });
    const entities = videos.items.map(YoutubeiUtil.videoCompactToEntity);
    await this.cacheVideos(entities);
    return entities;
  }

  public async searchOneVideo(keyword: string): Promise<YoutubeVideoCompact | undefined> {
    const video = (await this.youtubeClient.search(keyword, { type: "video" })).items.at(0);
    const entity = video ? YoutubeiUtil.videoCompactToEntity(video) : undefined;
    if (entity) await this.cacheVideos([entity]);
    return entity;
  }

  public async getVideo(id: string): Promise<YoutubeVideo | undefined> {
    const video = await this.youtubeClient.getVideo(id);
    if (!video) return;

    const entity = YoutubeiUtil.videoToEntity(video);
    await this.cacheVideos([entity]);
    return entity;
  }

  public async getPlaylistVideos(youtubePlaylistId: string): Promise<YoutubeVideoCompact[]> {
    const playlist = await this.youtubeClient.getPlaylist(youtubePlaylistId);
    if (!playlist) return [];
    if (playlist instanceof MixPlaylist) {
      const entities = playlist.videos.map(YoutubeiUtil.videoCompactToEntity);
      await this.cacheVideos(entities);
      return entities;
    }

    await playlist.videos.next(MAX_PLAYLIST_VIDEOS_PAGE - 1);
    const entities = playlist.videos.items.map(YoutubeiUtil.videoCompactToEntity);
    await this.cacheVideos(entities);
    return entities;
  }

  private async cacheVideos(videos: (YoutubeVideo | YoutubeVideoCompact)[]): Promise<void> {
    if (!this.cacheAll || !this.youtubeService || !videos.length) return;

    const parsedVideos = videos
      .map((v) => {
        if (v instanceof YoutubeVideoCompact) return v;
        else return [YoutubeiUtil.videoCompactToEntity(v), ...v.related];
      })
      .flat();

    await this.youtubeService.cacheVideo(parsedVideos, { ignoreEmbedFetch: true, newOnly: true });
  }
}
