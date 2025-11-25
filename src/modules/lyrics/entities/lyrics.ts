interface ConstructorProps {
  mediaSourceId: string;
  source: string;
  richSynced: string | null;
  synced: string | null;
  unsynced: string | null;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Lyrics {
  public readonly mediaSourceId: string;

  public readonly source: string;
  public readonly richSynced: string | null;
  public readonly synced: string | null;
  public readonly unsynced: string | null;
  public readonly duration: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ConstructorProps) {
    this.mediaSourceId = props.mediaSourceId;
    this.source = props.source;
    this.richSynced = props.richSynced;
    this.synced = props.synced;
    this.unsynced = props.unsynced;
    this.duration = props.duration;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
