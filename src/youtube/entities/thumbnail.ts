interface Props {
  url: string;
  width: number;
  height: number;
}

export class YoutubeThumbnail implements Props {
  public readonly url: string;
  public readonly width: number;
  public readonly height: number;

  constructor(props: Props) {
    this.url = props.url;
    this.width = props.width;
    this.height = props.height;
  }
}
