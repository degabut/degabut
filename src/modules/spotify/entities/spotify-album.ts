import { Image } from "@common/entities";

import { SpotifyAlbumCompact } from "./spotify-album-compact";
import { SpotifyTrack } from "./spotify-track";

interface Props {
  id: string;
  name: string;
  images: Image[];
  tracks: SpotifyTrack[];
}

export class SpotifyAlbum extends SpotifyAlbumCompact {
  public readonly tracks: SpotifyTrack[];

  constructor(props: Props) {
    super(props);
    this.tracks = props.tracks;
  }
}
