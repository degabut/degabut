import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

import { ILyricProvider, ILyricsResponse } from "./lyrics.provider.interface";

interface LrcLibResponse {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string;
  syncedLyrics: string;
}

@Injectable()
export class LrclibLyricsProvider implements ILyricProvider {
  private readonly LRCLIB_API = "https://lrclib.net/api/get";

  constructor(private httpService: HttpService) {}

  public async getLyrics(
    artist: string,
    title: string,
    album: string | null,
    duration: number | null,
  ): Promise<ILyricsResponse | null> {
    const response = await this.httpService.axiosRef.get<LrcLibResponse>(this.LRCLIB_API, {
      params: {
        artist_name: artist,
        track_name: title,
        album_name: album,
        duration: duration,
      },
    });

    if (!response.data || response.status !== 200) return null;

    return {
      richSynced: null,
      synced: response.data.syncedLyrics,
      unsynced: response.data.plainLyrics,
      duration: response.data.duration,
      debugInfo: null,
    };
  }
}
