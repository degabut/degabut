import { SpotifyAlbumCompact } from "./spotify-album-compact";
import { SpotifyArtist } from "./spotify-artist";

interface Props {
  id: string;
  name: string;
  durationMs: number;
  albumId: string;
  updatedAt?: Date;
  artists?: SpotifyArtist[];
  album?: SpotifyAlbumCompact;
}

export class SpotifyTrack implements Props {
  public readonly id: string;
  public readonly name: string;
  public readonly durationMs: number;
  public readonly albumId: string;
  public readonly updatedAt: Date;
  public readonly artists?: SpotifyArtist[];
  public readonly album?: SpotifyAlbumCompact;

  constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.durationMs = props.durationMs;
    this.albumId = props.albumId;
    this.updatedAt = props.updatedAt || new Date();
    this.artists = props.artists;
    this.album = props.album;
  }

  get duration(): number {
    return Math.round(this.durationMs / 1000);
  }
}
