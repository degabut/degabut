import { VideoCompact } from "@youtube/entities";

interface Props {
  userId: string;
  videoId: string;
  likedAt?: Date;

  video?: VideoCompact;
}

export class UserLikeVideo implements Props {
  public readonly userId: string;
  public readonly videoId: string;
  public readonly likedAt: Date;

  public readonly video?: VideoCompact;

  constructor(props: Props) {
    this.userId = props.userId;
    this.videoId = props.videoId;
    this.likedAt = props.likedAt || new Date();

    this.video = props.video;
  }
}
