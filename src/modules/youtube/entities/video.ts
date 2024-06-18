import { Image } from "@common/entities";

import { YoutubeChannel } from "./channel";
import { YoutubeVideoCompact } from "./video-compact";

interface Props {
  id: string;
  title: string;
  duration: number;
  thumbnails: Image[];
  channel: YoutubeChannel | null;
  viewCount: number | null;
  related: YoutubeVideoCompact[];
}

export class YoutubeVideo implements Props {
  public readonly id: string;
  public readonly title: string;
  public readonly duration: number;
  public readonly thumbnails: Image[];
  public readonly channel: YoutubeChannel | null;
  public readonly viewCount: number | null;
  public readonly related: YoutubeVideoCompact[];

  constructor(props: Props) {
    this.id = props.id;
    this.title = props.title;
    this.duration = props.duration;
    this.thumbnails = props.thumbnails;
    this.channel = props.channel;
    this.viewCount = props.viewCount;
    this.related = props.related;
  }
}
