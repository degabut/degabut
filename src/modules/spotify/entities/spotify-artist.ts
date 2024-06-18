interface Props {
  id: string;
  name: string;
}

export class SpotifyArtist {
  public readonly id: string;
  public readonly name: string;

  constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
  }
}
