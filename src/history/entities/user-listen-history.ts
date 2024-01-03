import { MediaSource } from "@media-source/entities";

interface ConstructorProps {
  mediaSourceId: string;
  userId: string;
  voiceChannelId: string;
  guildId: string;
  isRequester: boolean;
  listenedAt: Date;
  mediaSource?: MediaSource;
}

export class UserListenHistory {
  public readonly mediaSourceId: string;
  public readonly userId: string;
  public readonly voiceChannelId: string;
  public readonly guildId: string;
  public readonly isRequester: boolean;
  public readonly listenedAt: Date;
  public readonly mediaSource?: MediaSource;

  constructor(props: ConstructorProps) {
    this.mediaSourceId = props.mediaSourceId;
    this.userId = props.userId;
    this.voiceChannelId = props.voiceChannelId;
    this.guildId = props.guildId;
    this.isRequester = props.isRequester;
    this.listenedAt = props.listenedAt;
    this.mediaSource = props.mediaSource;
  }
}
