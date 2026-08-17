import { HttpService } from "@nestjs/axios";
import { YoutubeCachedService } from "@youtube/services/youtube-cached.service";

import {
  IYoutubeiMusicProvider,
  SearchAllResult,
  YoutubeMusicSong,
  YoutubeMusicVideo,
} from "./youtubei-music.interface";
import { YoutubeiMusicUtil } from "./youtubei-music.util";

type DegabutYoutubeiMusicProviderOptions = {
  httpService: HttpService;
  baseUrl: string;
  authToken: string;
  cacheAll?: boolean;
  youtubeService?: YoutubeCachedService;
};

export class DegabutYoutubeiMusicProvider implements IYoutubeiMusicProvider {
  private readonly httpService: HttpService;
  private readonly baseUrl: string;
  private readonly authToken: string;
  private readonly cacheAll: boolean;
  private readonly youtubeService?: YoutubeCachedService;

  constructor(options: DegabutYoutubeiMusicProviderOptions) {
    this.httpService = options.httpService;
    this.baseUrl = options.baseUrl;
    this.authToken = options.authToken;
    this.cacheAll = options?.cacheAll ?? false;
    this.youtubeService = options?.youtubeService;
  }

  public async searchAll(keyword: string): Promise<SearchAllResult> {
    const response = await this.get("/music/search", { keyword });
    await this.cacheSongs(YoutubeiMusicUtil.searchResultToVideoCompact(response.data));
    return response.data;
  }

  public async searchSong(keyword: string): Promise<YoutubeMusicSong[]> {
    const response = await this.get("/music/songs", { keyword });
    const songs = response.data.items;
    await this.cacheSongs(songs);
    return songs;
  }

  private async cacheSongs(songs: (YoutubeMusicSong | YoutubeMusicVideo)[]): Promise<void> {
    if (!this.cacheAll || !this.youtubeService || !songs.length) return;

    await this.youtubeService.cacheVideo(songs.map(YoutubeiMusicUtil.musicToVideoCompact), {
      ignoreEmbedFetch: true,
      newOnly: true,
    });
  }

  private async get(path: string, params?: Record<string, string>) {
    const response = await this.httpService.axiosRef.get(this.baseUrl + path, {
      params,
      headers: { Authorization: "Bearer " + this.authToken },
    });
    return response;
  }
}
