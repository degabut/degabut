import { SpotifyAlbumCompact } from "./spotify-album-compact";
import { SpotifyImage } from "./spotify-image";
import { SpotifyTrack } from "./spotify-track";

interface Props {
  id: string;
  name: string;
  images: SpotifyImage[];
  tracks: SpotifyTrack[];
}

export class SpotifyAlbum extends SpotifyAlbumCompact {
  public readonly tracks: SpotifyTrack[];

  constructor(props: Props) {
    super(props);
    this.tracks = props.tracks;
  }
}
