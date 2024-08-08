import {
  MusicAlbumCompact,
  MusicArtistCompact,
  MusicPlaylistCompact,
  MusicSongCompact,
  MusicVideoCompact,
} from "youtubei";

import {
  MusicAlbumCompactDto,
  MusicPlaylistCompactDto,
  MusicSongCompactDto,
  MusicVideoCompactDto,
} from "../dtos";

export class YoutubeApiDtoUtils {
  static toDto(
    item:
      | MusicAlbumCompact
      | MusicPlaylistCompact
      | MusicSongCompact
      | MusicVideoCompact
      | MusicArtistCompact,
  ):
    | MusicAlbumCompactDto
    | MusicPlaylistCompactDto
    | MusicSongCompactDto
    | MusicVideoCompactDto
    | undefined {
    if (item instanceof MusicSongCompact) return MusicSongCompactDto.create(item);
    if (item instanceof MusicVideoCompact) return MusicVideoCompactDto.create(item);
    if (item instanceof MusicPlaylistCompact) return MusicPlaylistCompactDto.create(item);
    if (item instanceof MusicAlbumCompact) return MusicAlbumCompactDto.create(item);
  }
}
