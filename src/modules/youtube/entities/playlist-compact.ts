import { Image } from "@common/entities";

import { YoutubeChannel } from "./channel";

interface Props {
  id: string;
  title: string;
  videoCount: number;
  channel: YoutubeChannel | null;
  thumbnails: Image[];
}

export class YoutubePlaylistCompact implements Props {
  public readonly id: string;
  public readonly title: string;
  public readonly videoCount: number;
  public readonly channel: YoutubeChannel | null;
  public readonly thumbnails: Image[];

  constructor(props: Props) {
    this.id = props.id;
    this.title = props.title;
    this.videoCount = props.videoCount;
    this.channel = props.channel;
    this.thumbnails = props.thumbnails;
  }
}
