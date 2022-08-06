import { VideoCompact } from "@youtube/entities";
import { v4 } from "uuid";

import { Queue } from "./queue";

interface ConstructorProps {
  queue: Queue;
  video: VideoCompact;
  requestedBy: string;
}

export class Track {
  public readonly queue: Queue;
  public readonly id: string;
  public readonly video: VideoCompact;
  public readonly requestedBy: string;
  public playedAt: Date | null;

  constructor(props: ConstructorProps) {
    this.id = v4();
    this.video = props.video;
    this.requestedBy = props.requestedBy;
    this.queue = props.queue;
    this.playedAt = null;
  }

  public get url(): string {
    return `https://youtu.be/${this.video.id}`;
  }
}
