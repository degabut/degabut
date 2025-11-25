import {
  MusicAlbumCompact,
  MusicArtistCompact,
  MusicPlaylistCompact,
  MusicSongCompact,
  MusicVideoCompact,
} from "youtubei";

export type YoutubeMusicSong = MusicSongCompact;
export type YoutubeMusicAlbum = MusicAlbumCompact;
export type YoutubeMusicPlaylist = MusicPlaylistCompact;
export type YoutubeMusicVideo = MusicVideoCompact;
export type YoutubeMusicArtist = MusicArtistCompact;

type AllResultType =
  | YoutubeMusicSong
  | YoutubeMusicAlbum
  | YoutubeMusicPlaylist
  | YoutubeMusicVideo
  | YoutubeMusicArtist;

export type SearchAllResult = {
  top: {
    item: AllResultType;
    more: AllResultType[];
  } | null;

  items: AllResultType[];
};

export interface IYoutubeiMusicProvider {
  searchAll(keyword: string): Promise<SearchAllResult>;
  searchSong(keyword: string): Promise<YoutubeMusicSong[]>;
}
