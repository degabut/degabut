interface Props {
  start: number;
  duration: number;
  text: string;
}

export class Transcript implements Props {
  public readonly start: number;
  public readonly duration: number;
  public readonly text: string;

  constructor(props: Props) {
    this.start = props.start;
    this.duration = props.duration;
    this.text = props.text;
  }

  get end(): number {
    return this.start + this.duration;
  }
}
