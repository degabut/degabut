import { Channel } from "./channel";
import { Thumbnail } from "./thumbnail";

interface Props {
  id: string;
  title: string;
  duration: number;
  thumbnails: Thumbnail[];
  channel: Channel | null;
  viewCount: number | null;
}

export class VideoCompact implements Props {
  public readonly id: string;
  public readonly title: string;
  public readonly duration: number;
  public readonly thumbnails: Thumbnail[];
  public readonly channel: Channel | null;
  public readonly viewCount: number | null;

  constructor(props: Props) {
    this.id = props.id;
    this.title = props.title;
    this.duration = props.duration;
    this.thumbnails = props.thumbnails;
    this.channel = props.channel;
    this.viewCount = props.viewCount;
  }
}
