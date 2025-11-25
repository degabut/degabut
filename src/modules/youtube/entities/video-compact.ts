import { Image } from "@common/entities";

import { YoutubeChannel } from "./channel";

interface MusicMetadata {
  imageUrl: string;
  title: string;
  artist: string;
  album?: string;
}

interface Props {
  id: string;
  title: string;
  duration: number;
  thumbnails: Image[];
  channel: YoutubeChannel | null;
  viewCount: number | null;
  updatedAt?: Date;
  musicMetadata?: MusicMetadata | null;
}

export class YoutubeVideoCompact implements Props {
  public readonly id: string;
  public title: string;
  public readonly duration: number;
  public readonly thumbnails: Image[];
  public readonly channel: YoutubeChannel | null;
  public readonly viewCount: number | null;
  public readonly updatedAt: Date;
  public musicMetadata: MusicMetadata | null = null;

  constructor(props: Props) {
    this.id = props.id;
    this.title = props.title;
    this.duration = props.duration;
    this.thumbnails = props.thumbnails;
    this.channel = props.channel;
    this.viewCount = props.viewCount;
    this.updatedAt = props.updatedAt || new Date();
    this.musicMetadata = props.musicMetadata || null;
  }
}
