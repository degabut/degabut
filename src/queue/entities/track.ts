import { MediaSource } from "@media-source/entities";
import { v4 } from "uuid";

import { Member } from "./member";
import { Queue } from "./queue";

interface ConstructorProps {
  queue: Queue;
  mediaSource: MediaSource;
  requestedBy?: Member;
}

export class Track {
  public readonly queue: Queue;
  public readonly id: string;
  public readonly mediaSource: MediaSource;
  public readonly requestedBy: Member | null;
  public playedAt: Date | null;

  constructor(props: ConstructorProps) {
    this.id = v4();
    this.mediaSource = props.mediaSource;
    this.requestedBy = props.requestedBy || null;
    this.queue = props.queue;
    this.playedAt = null;
  }
}
