interface Props {
  url: string;
  height: number;
  width: number;
}

export class SpotifyImage implements Props {
  public readonly url: string;
  public readonly height: number;
  public readonly width: number;

  constructor(props: Props) {
    this.url = props.url;
    this.height = props.height;
    this.width = props.width;
  }
}
