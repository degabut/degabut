import { Channel } from "./channel";
import { Thumbnail } from "./thumbnail";

interface Props {
  id: string;
  title: string;
  videoCount: number;
  channel: Channel | null;
  thumbnails: Thumbnail[];
}

export class PlaylistCompact implements Props {
  public readonly id: string;
  public readonly title: string;
  public readonly videoCount: number;
  public readonly channel: Channel | null;
  public readonly thumbnails: Thumbnail[];

  constructor(props: Props) {
    this.id = props.id;
    this.title = props.title;
    this.videoCount = props.videoCount;
    this.channel = props.channel;
    this.thumbnails = props.thumbnails;
  }
}
