import { Injectable } from "@nestjs/common";
import {
  MusicAlbumCompact,
  MusicArtistCompact,
  MusicLyrics,
  MusicPlaylistCompact,
  MusicSearchResult,
  MusicSearchTypeEnum,
  MusicVideoCompact,
  MusicClient as YoutubeiMusicClient,
} from "youtubei";

type SearchResult = (
  | MusicVideoCompact
  | MusicAlbumCompact
  | MusicPlaylistCompact
  | MusicArtistCompact
)[];

@Injectable()
export class YoutubeiMusicProvider {
  private readonly musicClient = new YoutubeiMusicClient();

  public async searchAll(keyword: string): Promise<SearchResult> {
    const result = await this.musicClient.searchAll(keyword);
    return result.items;
  }

  public async searchSong(keyword: string) {
    return await this.musicClient.search(keyword, "song");
  }

  public async getLyrics(id: string): Promise<MusicLyrics | undefined> {
    return await this.musicClient.getLyrics(id);
  }

  public async getSearchSongContinuation(token: string) {
    const songs = new MusicSearchResult<MusicSearchTypeEnum.Song>({
      client: this.musicClient,
      type: "song",
    });
    songs.continuation = token;
    await songs.next();

    return songs;
  }
}
