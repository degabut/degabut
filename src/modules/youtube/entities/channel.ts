import { Image } from "@common/entities";

interface Props {
  id: string;
  name: string;
  thumbnails: Image[];
}

export class YoutubeChannel implements Props {
  public readonly id: string;
  public readonly name: string;
  public readonly thumbnails: Image[];

  constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.thumbnails = props.thumbnails;
  }
}
