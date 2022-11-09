import { VideoCompact } from "@youtube/entities";
import { v4 } from "uuid";

interface ConstructorProps {
  id?: string;
  playlistId: string;
  videoId: string;
  video?: VideoCompact;
  createdBy: string;
  createdAt?: Date;
}

export class PlaylistVideo {
  public readonly id: string;
  public readonly playlistId: string;
  public readonly videoId: string;
  public readonly createdBy: string;
  public readonly createdAt: Date;
  public readonly video?: VideoCompact;

  constructor(props: ConstructorProps) {
    this.id = props.id || v4();
    this.playlistId = props.playlistId;
    this.videoId = props.videoId;
    this.video = props.video;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt || new Date();
  }
}
