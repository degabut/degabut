import { MediaSource } from "@media-source/entities";
import { v4 } from "uuid";

interface ConstructorProps {
  id?: string;
  playlistId: string;
  mediaSourceId: string;
  mediaSource?: MediaSource;
  createdBy: string;
  createdAt?: Date;
}

export class PlaylistMediaSource {
  public readonly id: string;
  public readonly playlistId: string;
  public readonly mediaSourceId: string;
  public readonly createdBy: string;
  public readonly createdAt: Date;
  public readonly mediaSource?: MediaSource;

  constructor(props: ConstructorProps) {
    this.id = props.id || v4();
    this.playlistId = props.playlistId;
    this.mediaSourceId = props.mediaSourceId;
    this.mediaSource = props.mediaSource;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt || new Date();
  }
}
