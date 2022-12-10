export class Guild {
  public id!: string;
  public name!: string;
  public icon!: string | null;

  constructor(params: Guild) {
    Object.assign(this, params);
  }
}
