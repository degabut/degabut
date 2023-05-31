interface ConstructorProps {
  videoId: string;
  userId: string;
  voiceChannelId: string;
  guildId: string;
  isRequester: boolean;
  listenedAt: Date;
}

export class UserListenHistory {
  public readonly videoId: string;
  public readonly userId: string;
  public readonly voiceChannelId: string;
  public readonly guildId: string;
  public readonly isRequester: boolean;
  public readonly listenedAt: Date;

  constructor(props: ConstructorProps) {
    this.videoId = props.videoId;
    this.userId = props.userId;
    this.voiceChannelId = props.voiceChannelId;
    this.guildId = props.guildId;
    this.isRequester = props.isRequester;
    this.listenedAt = props.listenedAt;
  }
}
