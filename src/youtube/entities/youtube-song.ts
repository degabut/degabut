interface Props {
  id: string;
}

// TODO complete this
export class YoutubeSong implements Props {
  public readonly id: string;

  constructor(props: Props) {
    this.id = props.id;
  }
}
