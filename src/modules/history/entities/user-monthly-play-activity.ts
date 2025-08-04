interface ConstructorProps {
  userId: string;
  date: Date;
  playCount: number;
  uniquePlayCount: number;
}

export class UserMonthlyPlayActivity {
  public readonly userId: string;
  public readonly date: Date;
  public readonly playCount: number;
  public readonly uniquePlayCount: number;

  constructor(props: ConstructorProps) {
    this.userId = props.userId;
    this.date = props.date;
    this.playCount = props.playCount;
    this.uniquePlayCount = props.uniquePlayCount;
  }
}
