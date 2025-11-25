export interface ILyricsResponse {
  richSynced: string | null;
  synced: string | null;
  unsynced: string | null;
  duration: number;
  debugInfo: any;
}

export interface ILyricProvider {
  getLyrics(
    artist: string,
    title: string,
    album: string | null,
    duration: number | null,
  ): Promise<ILyricsResponse | null>;
}
