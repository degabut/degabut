interface ConstructorProps {
  videoId: string;
  userId: string;
  playedAt: Date;
}

export class UserPlayHistory {
  public readonly videoId: string;
  public readonly userId: string;
  public readonly playedAt: Date;

  constructor(props: ConstructorProps) {
    this.videoId = props.videoId;
    this.userId = props.userId;
    this.playedAt = props.playedAt;
  }
}
