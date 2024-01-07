import { Member } from "./member";

type VoiceChannelParams = {
  id: string;
  name: string;
  members: Member[];
};

export class VoiceChannel implements VoiceChannelParams {
  public id!: string;
  public name!: string;
  public members!: Member[];

  constructor(params: VoiceChannelParams) {
    Object.assign(this, params);
  }

  get activeMembers(): Member[] {
    return this.members.filter((m) => m.isInVoiceChannel);
  }
}
