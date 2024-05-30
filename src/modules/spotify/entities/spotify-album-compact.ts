import { SpotifyImage } from "./spotify-image";

interface Props {
  id: string;
  name: string;
  images: SpotifyImage[];
}

export class SpotifyAlbumCompact {
  public readonly id: string;
  public readonly name: string;
  public readonly images: SpotifyImage[];

  constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.images = props.images;
  }
}
