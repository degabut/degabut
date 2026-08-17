import { HttpService } from "@nestjs/axios";
import { YoutubeVideo, YoutubeVideoCompact } from "@youtube/entities";
import { YoutubeCachedService } from "@youtube/services/youtube-cached.service";
import { MAX_PLAYLIST_VIDEOS_PAGE } from "@youtube/youtube.constants";

import { IYoutubeiProvider } from "./youtubei.interface";
import { YoutubeiUtil } from "./youtubei.util";

type DegabutYoutubeiProviderOptions = {
  httpService: HttpService;
  baseUrl: string;
  authToken: string;
  cacheAll?: boolean;
  youtubeService?: YoutubeCachedService;
};

export class DegabutYoutubeiProvider implements IYoutubeiProvider {
  private readonly httpService: HttpService;
  private readonly baseUrl: string;
  private readonly authToken: string;
  private readonly cacheAll: boolean;
  private readonly youtubeService?: YoutubeCachedService;

  constructor(options: DegabutYoutubeiProviderOptions) {
    this.httpService = options.httpService;
    this.baseUrl = options.baseUrl;
    this.authToken = options.authToken;
    this.cacheAll = options?.cacheAll ?? false;
    this.youtubeService = options?.youtubeService;
  }

  public async searchVideo(keyword: string): Promise<YoutubeVideoCompact[]> {
    const response = await this.get("/videos", { keyword });
    const entities = response.data.map(YoutubeiUtil.videoCompactToEntity) || [];
    await this.cacheVideos(entities);
    return entities;
  }

  public async searchOneVideo(keyword: string): Promise<YoutubeVideoCompact | undefined> {
    const response = await this.get("/videos", { keyword });
    const entity = YoutubeiUtil.videoCompactToEntity(response.data[0]) || undefined;
    if (entity) await this.cacheVideos([entity]);
    return entity;
  }

  public async getVideo(id: string): Promise<YoutubeVideo | undefined> {
    const response = await this.get(`/videos/${id}`);
    if (response.status === 404) return;
    const entity = YoutubeiUtil.videoToEntity(response.data) || undefined;
    if (entity) await this.cacheVideos([entity]);
    return entity;
  }

  public async getPlaylistVideos(id: string): Promise<YoutubeVideoCompact[]> {
    const response = await this.get(`/playlists/${id}`);
    if (response.status === 404) return [];

    const { videos } = response.data;
    if (Array.isArray(videos)) {
      const entities = videos.map(YoutubeiUtil.videoCompactToEntity);
      await this.cacheVideos(entities);
      return entities;
    }

    let token = videos.continuation;
    const items = videos.items;

    for (let i = 0; i < MAX_PLAYLIST_VIDEOS_PAGE - 1; i++) {
      if (!token) break;
      const response = await this.get("/continuation/playlists-videos", { token });
      if (response.status === 404) break;

      token = response.data.continuation;
      items.push(...response.data.items);
    }

    const entities = items.map(YoutubeiUtil.videoCompactToEntity);
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

  private async get(path: string, params?: Record<string, string>) {
    const response = await this.httpService.axiosRef.get(this.baseUrl + path, {
      params,
      headers: { Authorization: "Bearer " + this.authToken },
    });
    return response;
  }
}
