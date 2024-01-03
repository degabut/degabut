import { MediaSource } from "@media-source/entities";

interface Props {
  userId: string;
  mediaSourceId: string;
  likedAt?: Date;

  mediaSource?: MediaSource;
}

export class UserLikeMediaSource implements Props {
  public readonly userId: string;
  public readonly mediaSourceId: string;
  public readonly likedAt: Date;

  public readonly mediaSource?: MediaSource;

  constructor(props: Props) {
    this.userId = props.userId;
    this.mediaSourceId = props.mediaSourceId;
    this.likedAt = props.likedAt || new Date();

    this.mediaSource = props.mediaSource;
  }
}
