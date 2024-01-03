import { MediaSource } from "@media-source/entities";

interface ConstructorProps {
  mediaSourceId: string;
  userId: string;
  voiceChannelId: string | null;
  guildId: string | null;
  playedAt: Date;
  mediaSource?: MediaSource;
}

export class UserPlayHistory {
  public readonly mediaSourceId: string;
  public readonly userId: string;
  public readonly playedAt: Date;
  public readonly voiceChannelId: string | null;
  public readonly guildId: string | null;
  public readonly mediaSource?: MediaSource;

  constructor(props: ConstructorProps) {
    this.mediaSourceId = props.mediaSourceId;
    this.userId = props.userId;
    this.voiceChannelId = props.voiceChannelId;
    this.guildId = props.guildId;
    this.playedAt = props.playedAt;
    this.mediaSource = props.mediaSource;
  }
}
