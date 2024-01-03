import { YoutubeChannel } from "./channel";
import { YoutubeThumbnail } from "./thumbnail";

interface Props {
  id: string;
  title: string;
  videoCount: number;
  channel: YoutubeChannel | null;
  thumbnails: YoutubeThumbnail[];
}

export class YoutubePlaylistCompact implements Props {
  public readonly id: string;
  public readonly title: string;
  public readonly videoCount: number;
  public readonly channel: YoutubeChannel | null;
  public readonly thumbnails: YoutubeThumbnail[];

  constructor(props: Props) {
    this.id = props.id;
    this.title = props.title;
    this.videoCount = props.videoCount;
    this.channel = props.channel;
    this.thumbnails = props.thumbnails;
  }
}
