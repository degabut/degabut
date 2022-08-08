export class Member {
  public id!: string;
  public displayName!: string;
  public nickname!: string | null;
  public username!: string;
  public discriminator!: string;
  public avatar!: string | null;

  constructor(params: Member) {
    Object.assign(this, params);
  }
}
