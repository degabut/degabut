import {
  MusicAlbumCompact,
  MusicArtistCompact,
  MusicPlaylistCompact,
  MusicSongCompact,
  MusicVideoCompact,
  Shelf,
} from "youtubei";

export type YoutubeMusicSong = MusicSongCompact;
export type YoutubeMusicAlbum = MusicAlbumCompact;
export type YoutubeMusicPlaylist = MusicPlaylistCompact;
export type YoutubeMusicVideo = MusicVideoCompact;
export type YoutubeMusicArtist = MusicArtistCompact;

export type SearchAllResult = {
  top?: {
    item?:
      | YoutubeMusicSong
      | YoutubeMusicAlbum
      | YoutubeMusicPlaylist
      | YoutubeMusicVideo
      | YoutubeMusicArtist;
    more?: (
      | YoutubeMusicSong
      | YoutubeMusicAlbum
      | YoutubeMusicPlaylist
      | YoutubeMusicVideo
      | YoutubeMusicArtist
    )[];
  };
  shelves: Shelf<
    | YoutubeMusicSong[]
    | YoutubeMusicAlbum[]
    | YoutubeMusicPlaylist[]
    | YoutubeMusicVideo[]
    | YoutubeMusicArtist[]
  >[];
};

export interface IYoutubeiMusicProvider {
  searchAll(keyword: string): Promise<SearchAllResult>;
  searchSong(keyword: string): Promise<YoutubeMusicSong[]>;
}
