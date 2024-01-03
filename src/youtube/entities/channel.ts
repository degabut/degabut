import { YoutubeThumbnail } from "./thumbnail";

interface Props {
  id: string;
  name: string;
  thumbnails: YoutubeThumbnail[];
}

export class YoutubeChannel implements Props {
  public readonly id: string;
  public readonly name: string;
  public readonly thumbnails: YoutubeThumbnail[];

  constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.thumbnails = props.thumbnails;
  }
}
