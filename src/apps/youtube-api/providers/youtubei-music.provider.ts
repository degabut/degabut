import { Injectable } from "@nestjs/common";
import {
  MusicAlbumCompact,
  MusicArtistCompact,
  MusicLyrics,
  MusicPlaylistCompact,
  MusicSearchResult,
  MusicSongCompact,
  MusicVideoCompact,
  Shelf,
  MusicClient as YoutubeiMusicClient,
} from "youtubei";

type SearchResult = Shelf<
  MusicSongCompact[] | MusicVideoCompact[] | MusicAlbumCompact[] | MusicPlaylistCompact[]
>[];

@Injectable()
export class YoutubeiMusicProvider {
  private readonly musicClient = new YoutubeiMusicClient();

  public async search(keyword: string): Promise<SearchResult> {
    const result = await this.musicClient.search(keyword);
    return result.filter((i) => !(i.items.at(0) instanceof MusicArtistCompact)) as SearchResult;
  }

  public async searchSong(keyword: string) {
    return await this.musicClient.search(keyword, "song");
  }

  public async getLyrics(id: string): Promise<MusicLyrics | undefined> {
    return await this.musicClient.getLyrics(id);
  }

  public async getSearchSongContinuation(token: string) {
    const songs = new MusicSearchResult({
      client: this.musicClient,
      type: "song",
    });
    songs.continuation = token;
    await songs.next();

    return songs;
  }
}
