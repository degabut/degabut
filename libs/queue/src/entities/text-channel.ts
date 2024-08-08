export class TextChannel {
  public readonly id!: string;
  public readonly name!: string;

  constructor(params: TextChannel) {
    Object.assign(this, params);
  }
}
