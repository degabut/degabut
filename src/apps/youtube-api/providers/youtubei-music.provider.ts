import { Injectable } from "@nestjs/common";
import { YoutubeApiConfigService } from "@youtube-api/config";
import { YoutubeiMusicUtil } from "@youtube/providers/youtubei-music/youtubei-music.util";
import { YoutubeCachedService } from "@youtube/services";
import {
  MusicAlbumCompact,
  MusicArtistCompact,
  MusicLyrics,
  MusicPlaylistCompact,
  MusicSearchResult,
  MusicSearchTypeEnum,
  MusicSongCompact,
  MusicVideoCompact,
  MusicClient as YoutubeiMusicClient,
} from "youtubei";

type AllResultType =
  | MusicVideoCompact
  | MusicAlbumCompact
  | MusicPlaylistCompact
  | MusicArtistCompact;

type SearchResult = {
  top: {
    item: AllResultType;
    more: AllResultType[];
  } | null;

  items: AllResultType[];
};

@Injectable()
export class YoutubeiMusicProvider {
  private readonly musicClient = new YoutubeiMusicClient();
  private readonly cacheAll: boolean;

  constructor(
    private readonly youtubeService: YoutubeCachedService,
    config: YoutubeApiConfigService,
  ) {
    this.cacheAll = config.cacheAll;
  }

  public async searchAll(keyword: string): Promise<SearchResult> {
    const result = await this.musicClient.searchAll(keyword);
    await this.cacheSongs(YoutubeiMusicUtil.searchResultToVideoCompact(result));
    return result;
  }

  public async searchSong(keyword: string) {
    const songs = await this.musicClient.search(keyword, "song");
    await this.cacheSongs(songs.items);
    return songs;
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

    await this.cacheSongs(songs.items);
    return songs;
  }

  private async cacheSongs(songs: (MusicSongCompact | MusicVideoCompact)[]): Promise<void> {
    if (!this.cacheAll || !songs.length) return;
    await this.youtubeService.cacheVideo(songs.map(YoutubeiMusicUtil.musicToVideoCompact), {
      ignoreEmbedFetch: true,
      newOnly: true,
    });
  }
}
