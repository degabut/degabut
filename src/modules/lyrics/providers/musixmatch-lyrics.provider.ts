// Types for our responses and data
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { diffArrays } from "diff";

import { LyricsUtil } from "../util";
import { ILyricProvider, ILyricsResponse } from "./lyrics.provider.interface";

interface MusixmatchResponse {
  message: Message;
}

interface Message {
  header: Header;
  body: Body;
}

interface Header {
  status_code: number;
  execute_time: number;
  confidence: number;
  mode: string;
  cached: number;
}

interface Body {
  richsync: any;
  subtitle: any;
  track: Track;
  user_token: string;
}

interface Track {
  track_id: number;
  track_mbid: string;
  track_isrc: string;
  commontrack_isrcs: string[][];
  track_spotify_id: string;
  commontrack_spotify_ids: string[];
  commontrack_itunes_ids: number[];
  track_soundcloud_id: number;
  track_xboxmusic_id: string;
  track_name: string;
  track_name_translation_list: any[];
  track_rating: number;
  track_length: number;
  commontrack_id: number;
  instrumental: number;
  explicit: number;
  has_lyrics: number;
  has_lyrics_crowd: number;
  has_subtitles: number;
  has_richsync: number;
  has_track_structure: number;
  num_favourite: number;
  lyrics_id: number;
  subtitle_id: number;
  album_id: number;
  album_name: string;
  album_vanity_id: string;
  artist_id: number;
  artist_mbid: string;
  artist_name: string;
  album_coverart_100x100: string;
  album_coverart_350x350: string;
  album_coverart_500x500: string;
  album_coverart_800x800: string;
  track_share_url: string;
  track_edit_url: string;
  commontrack_vanity_id: string;
  restricted: number;
  first_release_date: string;
  updated_time: string;
  primary_genres: PrimaryGenres;
  secondary_genres: SecondaryGenres;
}

interface PrimaryGenres {
  music_genre_list: MusicGenreList[];
}

interface MusicGenreList {
  music_genre: MusicGenre;
}

interface MusicGenre {
  music_genre_id: number;
  music_genre_parent_id: number;
  music_genre_name: string;
  music_genre_name_extended: string;
  music_genre_vanity: string;
}

interface SecondaryGenres {
  music_genre_list: any[];
}

interface RichSyncBody {
  /**
   * Start Time (s)
   */
  ts: number;
  /**
   * End Time (s)
   */
  te: number;
  l: TimedWord[];
  /**
   * Lyric Text (s)
   */
  x: string;
}

interface TimedWord {
  /**
   * Word (can be a space/similar)
   */
  c: string;
  /**
   * Offset in s from the lyric start time
   */
  o: number;
}

interface MatchingTimedWord {
  /**
   * Word (can be a space/similar)
   */
  word: string;
  wordTime: number;
}

// These fields can persist through multiple requests to the API
let tokenRetryCount = 0;
let tokenRetryMax = 3;

@Injectable()
export class MusixmatchLyricsProvider implements ILyricProvider {
  private token: string | null = null; // null means we haven't gotten a token yet
  private cookies: { key: string; cookie: string }[] = [];
  private readonly BASE_URL = "https://apic-desktop.musixmatch.com";
  private readonly API_URL = `${this.BASE_URL}/ws/1.1/`;
  private readonly DEFAULT_HEADERS: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    Origin: "https://www.musixmatch.com",
    Referer: "https://www.musixmatch.com/",
  };

  constructor(private readonly httpService: HttpService) {}

  private async get(action: string, params: Record<string, string>): Promise<AxiosResponse> {
    params["app_id"] = "web-desktop-app-v1.0";
    params["t"] = Date.now().toString();
    if (this.token && action !== "token.get") {
      params["usertoken"] = this.token;
    } else if (!this.token && action !== "token.get") {
      await this.getToken();
      params["usertoken"] = this.token!;
    }

    let url = new URL(this.API_URL + action);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    let response: AxiosResponse;
    let redirectCount = 0;
    do {
      const headers = { ...this.DEFAULT_HEADERS };

      if (this.cookies.length) {
        headers["Cookie"] = this.cookies.map(({ key, cookie }) => `${key}=${cookie}`).join(";");
      }

      response = await this.httpService.axiosRef.get(url.toString(), {
        headers,
        maxRedirects: 0,
      });

      // Store any new cookies
      response.headers["set-cookie"]?.forEach((cookieStr) => {
        let splitIndex = cookieStr.indexOf("=");
        if (splitIndex > -1) {
          let key = cookieStr.substring(0, splitIndex);
          let cookie = cookieStr.substring(splitIndex + 1, cookieStr.length).split(";")[0];
          this.cookies.push({ key, cookie });
        }
      });

      const location = response.headers["location"] as string;
      url = new URL(this.BASE_URL + location);

      redirectCount += 1;
      if (redirectCount > 5) throw new Error("too many redirects");
    } while (response.status === 302 || response.status === 301);

    if (!response.data) return Promise.reject("Body is missing");
    return response;
  }

  async getToken(): Promise<void> {
    if (this.token === null && tokenRetryCount < tokenRetryMax) {
      let response = await this.get("token.get", { user_language: "en" });
      const data = response.data as MusixmatchResponse;

      if (data.message.header.status_code === 401) {
        throw Error("Failed to get token");
      }

      this.token = data.message.body.user_token;
    } else if (this.token === null) {
      throw Error("Failed to get token");
    }
  }

  private formatTime(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const hundredths = Math.floor((timeInSeconds % 1) * 100);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
  }

  private async getLrcWordByWord(
    trackId: string | number,
    lrcLyrics: Promise<Omit<ILyricsResponse, "duration"> | null> | null,
  ): Promise<Omit<ILyricsResponse, "duration"> | null> {
    let musixmatchBasicLyrics: Promise<Omit<ILyricsResponse, "duration"> | null> =
      this.getLrcById(trackId);
    let basicLrcPromise: Promise<Omit<ILyricsResponse, "duration"> | null>;
    if (lrcLyrics !== null) {
      basicLrcPromise = lrcLyrics;
    } else {
      basicLrcPromise = musixmatchBasicLyrics;
    }
    const response = await this.get("track.richsync.get", { track_id: `${trackId}` });
    const data = response.data as MusixmatchResponse;
    let mean, variance;

    if (response.status !== 200) return null;

    const richSyncBody = JSON.parse(data.message.body.richsync.richsync_body) as RichSyncBody[];

    let lrcStr = "";
    let richSyncTokenArray: MatchingTimedWord[] = [];

    for (const item of richSyncBody) {
      lrcStr += `[${this.formatTime(item.ts)}] `;

      for (const lyric of item.l) {
        const time = this.formatTime(item.ts + lyric.o);
        lrcStr += `<${time}> ${lyric.c} `;

        richSyncTokenArray.push({
          word: lyric.c,
          wordTime: item.ts + lyric.o,
        });
      }
      richSyncTokenArray.push({
        word: "\n",
        wordTime: -1,
      });

      const endTime = this.formatTime(item.te);
      lrcStr += `<${endTime}>\n`;
    }

    let basicLrc = await basicLrcPromise;
    if (basicLrc && basicLrc.synced) {
      let basicLrcOffset = [] as number[];
      let diffDebug: { op: string; text: string }[] = [];

      let parsedLrc = LyricsUtil.parseLrc(basicLrc.synced);
      let parsedLrcTokenArray: MatchingTimedWord[] = [];
      parsedLrc.forEach(({ startTimeMs, words }, index) => {
        let wordsSplit = words.split(" ");
        for (let i = 0; i < wordsSplit.length; i++) {
          if (i === 0) {
            parsedLrcTokenArray.push({
              word: wordsSplit[i],
              wordTime: startTimeMs / 1000,
            });
          } else {
            parsedLrcTokenArray.push({
              word: wordsSplit[i],
              wordTime: -1,
            });
          }

          if (i !== wordsSplit.length - 1) {
            parsedLrcTokenArray.push({
              word: " ",
              wordTime: -1,
            });
          }
        }
        if (index < parsedLrc.length - 1) {
          parsedLrcTokenArray.push({
            word: "\n",
            wordTime: -1,
          });
        }
      });

      if (parsedLrcTokenArray.length > 5000 || richSyncTokenArray.length > 5000) {
        return {
          richSynced: null,
          synced: (await musixmatchBasicLyrics)?.synced || null,
          unsynced: null,
          debugInfo: {
            comment: "lyrics too long to diff",
          },
        };
      }
      let diff = diffArrays(parsedLrcTokenArray, richSyncTokenArray, {
        comparator: (left, right) => left.word.toLowerCase() === right.word.toLowerCase(),
      });

      let leftIndex = 0;
      let rightIndex = 0;
      diff.forEach((change) => {
        if (!change.removed && !change.added && change.value && change.count !== undefined) {
          for (let i = 0; i < change.count; i++) {
            let leftToken = parsedLrcTokenArray[leftIndex];
            let rightToken = richSyncTokenArray[rightIndex];

            if (leftToken.wordTime !== -1 && rightToken.wordTime !== -1) {
              basicLrcOffset.push(rightToken.wordTime - leftToken.wordTime);
              // console.log('found matching char with time', leftToken, rightToken);
            }
            leftIndex++;
            rightIndex++;
          }
          diffDebug.push({ op: "MATCH", text: change.value.map((word) => word.word).join("") });
          // console.log('found match', leftIndex, rightIndex, change.value.map(word => word.word).join('') + '\n');
        } else {
          if (!change.added && change.count !== undefined) {
            leftIndex += change.count;
            diffDebug.push({ op: "REMOVED", text: change.value.map((word) => word.word).join("") });
          }
          if (!change.removed && change.count !== undefined) {
            rightIndex += change.count;
            diffDebug.push({ op: "ADDED", text: change.value.map((word) => word.word).join("") });
          }
        }
      });

      let meanVar = this.meanAndVariance(basicLrcOffset);
      mean = meanVar.mean;
      variance = meanVar.variance;
      if (variance < 1.5) {
        lrcStr = `[offset:${this.addPlusSign(mean)}]\n` + lrcStr;
        return {
          richSynced: lrcStr,
          synced: (await musixmatchBasicLyrics)?.synced || null,
          unsynced: null,
          debugInfo: {
            lyricMatchingStats: { mean, variance, samples: basicLrcOffset, diff: diffDebug },
          },
        };
      } else {
        return {
          richSynced: null,
          synced: (await musixmatchBasicLyrics)?.synced || null,
          unsynced: null,
          debugInfo: {
            lyricMatchingStats: { mean, variance, samples: basicLrcOffset, diff: diffDebug },
            comment: "basic lyrics matched but variance is too high; using basic lyrics instead",
          },
        };
      }
    }

    return {
      richSynced: lrcStr,
      synced: null,
      unsynced: null,
      debugInfo: {
        comment: "no synced basic lyrics found",
      },
    };
  }

  private async getLrcById(
    trackId: string | number,
  ): Promise<Omit<ILyricsResponse, "duration"> | null> {
    // Get the main subtitles
    const response = await this.get("track.subtitle.get", {
      track_id: `${trackId}`,
      subtitle_format: "lrc",
    });

    if (response.status !== 200) return null;

    const data = response.data as MusixmatchResponse;
    if (!data.message.body?.subtitle?.subtitle_body) return null;

    let lrcStr = data.message.body.subtitle.subtitle_body;

    return { richSynced: null, synced: lrcStr, unsynced: null, debugInfo: null };
  }

  async getLyrics(
    artist: string,
    track: string,
    album: string | null,
  ): Promise<ILyricsResponse | null> {
    let query: Record<string, string> = {
      q_track: track,
      q_artist: artist,
      page_size: "1",
      page: "1",
    };
    if (album) query.album = album;

    const response = await this.get("matcher.track.get", query);

    let data = response.data as MusixmatchResponse;
    if (data.message.header.status_code === 401) {
      // The token is not valid
      // we're not going to retry b/c testing shows this won't work
      // instead just set it to null so the next request can try again
      this.token = null;
    }
    if (data.message.header.status_code !== 200) {
      return null;
    }

    const trackId = data.message.body.track.track_id;
    const hasRichLyrics = data.message.body.track.has_richsync;
    const hasSubtitles = data.message.body.track.has_subtitles;

    let result = null;
    if (hasRichLyrics) {
      result = await this.getLrcWordByWord(trackId, null);
    } else if (hasSubtitles) {
      result = await this.getLrcById(trackId);
    }

    if (!result) return null;

    return {
      ...result,
      duration: Math.round(data.message.body.track.track_length),
    };
  }

  private meanAndVariance(arr: number[]) {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    const variance = arr.reduce((acc, val) => acc + (val - mean) ** 2, 0) / arr.length;
    return { mean, variance };
  }

  private addPlusSign(num: number) {
    if (num > 0) {
      return `+${num}`;
    } else {
      return `${num}`;
    }
  }
}
