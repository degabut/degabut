export class TextChannel {
  public id!: string;
  public name!: string;

  constructor(params: TextChannel) {
    Object.assign(this, params);
  }
}
