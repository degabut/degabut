import { Member } from "./member";

export class VoiceChannel {
  public id!: string;
  public name!: string;
  public members!: Member[];

  constructor(params: VoiceChannel) {
    Object.assign(this, params);
  }
}
