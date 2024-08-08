import { Image } from "@common/entities";

import { SpotifyTrack } from "./spotify-track";

interface Props {
  id: string;
  name: string;
  tracks: SpotifyTrack[];
  images: Image[];
}

export class SpotifyPlaylist implements Props {
  public readonly id: string;
  public readonly name: string;
  public readonly tracks: SpotifyTrack[];
  public readonly images: Image[];

  constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.tracks = props.tracks;
    this.images = props.images;
  }
}
