import { Image } from "@common/entities";

interface Props {
  id: string;
  name: string;
  images: Image[];
}

export class SpotifyAlbumCompact {
  public readonly id: string;
  public readonly name: string;
  public readonly images: Image[];

  constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.images = props.images;
  }
}
