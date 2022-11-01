interface ConstructorProps {
  videoId: string;
  userId: string;
  voiceChannelId: string | null;
  guildId: string | null;
  playedAt: Date;
}

export class UserPlayHistory {
  public readonly videoId: string;
  public readonly userId: string;
  public readonly playedAt: Date;
  public readonly voiceChannelId: string | null;
  public readonly guildId: string | null;

  constructor(props: ConstructorProps) {
    this.videoId = props.videoId;
    this.userId = props.userId;
    this.voiceChannelId = props.voiceChannelId;
    this.guildId = props.guildId;
    this.playedAt = props.playedAt;
  }
}
