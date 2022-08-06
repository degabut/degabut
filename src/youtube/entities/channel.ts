import { Thumbnail } from "./thumbnail";

interface Props {
  id: string;
  name: string;
  thumbnails: Thumbnail[];
}

export class Channel implements Props {
  public readonly id: string;
  public readonly name: string;
  public readonly thumbnails: Thumbnail[];

  constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.thumbnails = props.thumbnails;
  }
}
