import { MediaSource } from "@media-source/entities";
import { v4 } from "uuid";

import { Member } from "./member";
import { Queue, QueueAutoplayType } from "./queue";

interface ConstructorProps {
  queue: Queue;
  mediaSource: MediaSource;
  requestedBy?: Member | null;
  autoplayData?: TrackAutoplayData | null;
}

export interface TrackAutoplayData {
  member: Member | null;
  type: QueueAutoplayType;
}

export class Track {
  public readonly queue: Queue;
  public readonly id: string;
  public mediaSource: MediaSource;
  public requestedBy: Member | null;
  public autoplayData: TrackAutoplayData | null;
  public playedAt: Date | null;

  constructor(props: ConstructorProps) {
    this.id = v4();
    this.mediaSource = props.mediaSource;
    this.requestedBy = props.requestedBy || null;
    this.autoplayData = props.autoplayData || null;
    this.queue = props.queue;
    this.playedAt = null;
  }

  get associatedUserId(): string | null {
    return this.requestedBy?.id || this.autoplayData?.member?.id || null;
  }
}
