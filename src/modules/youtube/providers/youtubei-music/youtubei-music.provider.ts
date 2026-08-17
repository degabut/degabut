import { Injectable } from "@nestjs/common";
import { YoutubeCachedService } from "@youtube/services/youtube-cached.service";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { MusicClient } from "youtubei";

import {
  IYoutubeiMusicProvider,
  SearchAllResult,
  YoutubeMusicSong,
  YoutubeMusicVideo,
} from "./youtubei-music.interface";
import { YoutubeiMusicUtil } from "./youtubei-music.util";

type YoutubeiMusicProviderOptions = {
  oauthRefreshToken?: string;
  proxyUrl?: string;
  cacheAll?: boolean;
  youtubeService?: YoutubeCachedService;
};

@Injectable()
export class YoutubeiMusicProvider implements IYoutubeiMusicProvider {
  private readonly musicClient: MusicClient;
  private readonly cacheAll: boolean;
  private readonly youtubeService?: YoutubeCachedService;

  constructor(options?: YoutubeiMusicProviderOptions) {
    const { oauthRefreshToken: refreshToken, proxyUrl, cacheAll, youtubeService } = options || {};
    this.cacheAll = cacheAll ?? false;
    this.youtubeService = youtubeService;

    let agent: HttpsProxyAgent<string> | HttpProxyAgent<string> | undefined = undefined;
    if (proxyUrl?.startsWith("https")) {
      agent = new HttpsProxyAgent(proxyUrl);
    } else if (proxyUrl) {
      agent = new HttpProxyAgent(proxyUrl);
    }

    this.musicClient = new MusicClient({
      oauth: refreshToken
        ? {
            enabled: true,
            refreshToken,
          }
        : undefined,
      fetchOptions: { agent },
    });
  }

  public async searchAll(keyword: string): Promise<SearchAllResult> {
    const result = await this.musicClient.searchAll(keyword);
    const searchResult = {
      top: result.top,
      items: result.items,
    };
    await this.cacheSongs(YoutubeiMusicUtil.searchResultToVideoCompact(searchResult));
    return searchResult;
  }

  public async searchSong(keyword: string): Promise<YoutubeMusicSong[]> {
    const songs = (await this.musicClient.search(keyword, "song")).items;
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
}
