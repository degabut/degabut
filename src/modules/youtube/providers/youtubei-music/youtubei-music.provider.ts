import { Injectable } from "@nestjs/common";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { MusicClient } from "youtubei";

import {
  IYoutubeiMusicProvider,
  SearchAllResult,
  YoutubeMusicSong,
} from "./youtubei-music.interface";

type YoutubeiMusicProviderOptions = {
  oauthRefreshToken?: string;
  proxyUrl?: string;
};

@Injectable()
export class YoutubeiMusicProvider implements IYoutubeiMusicProvider {
  private readonly musicClient: MusicClient;

  constructor(options?: YoutubeiMusicProviderOptions) {
    const { oauthRefreshToken: refreshToken, proxyUrl } = options || {};

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
    return result.items;
  }

  public async searchSong(keyword: string): Promise<YoutubeMusicSong[]> {
    return (await this.musicClient.search(keyword, "song")).items;
  }
}
