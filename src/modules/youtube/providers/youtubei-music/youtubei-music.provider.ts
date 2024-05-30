import { Injectable } from "@nestjs/common";
import { YoutubeSong } from "@youtube/entities";
import { MusicClient } from "youtubei";

import { IYoutubeiMusicProvider } from "./youtubei-music.interface";

@Injectable()
export class YoutubeiMusicProvider implements IYoutubeiMusicProvider {
  private readonly musicClient = new MusicClient();

  public async searchSong(keyword: string): Promise<YoutubeSong[]> {
    const songs = await this.musicClient.search(keyword, "song");
    return songs.items.map((s) => new YoutubeSong({ id: s.id }));
  }
}
