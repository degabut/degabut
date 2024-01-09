import { YoutubeSong } from "@youtube/entities";

export interface IYoutubeiMusicProvider {
  searchSong(keyword: string): Promise<YoutubeSong[]>;
}
