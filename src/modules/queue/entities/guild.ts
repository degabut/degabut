export class Guild {
  public readonly id!: string;
  public readonly name!: string;
  public readonly icon!: string | null;

  constructor(params: Guild) {
    Object.assign(this, params);
  }
}
