import { Injectable } from "@nestjs/common";
import { MusicClient } from "youtubei";

import {
  IYoutubeiMusicProvider,
  SearchAllResult,
  YoutubeMusicSong,
} from "./youtubei-music.interface";

@Injectable()
export class YoutubeiMusicProvider implements IYoutubeiMusicProvider {
  private readonly musicClient = new MusicClient();

  public async searchAll(keyword: string): Promise<SearchAllResult> {
    return await this.musicClient.searchAll(keyword);
  }

  public async searchSong(keyword: string): Promise<YoutubeMusicSong[]> {
    return (await this.musicClient.search(keyword, "song")).items;
  }
}
