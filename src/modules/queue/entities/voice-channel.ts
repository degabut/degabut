import { Member } from "./member";

type VoiceChannelParams = {
  id: string;
  name: string;
  members: Member[];
};

export class VoiceChannel implements VoiceChannelParams {
  public readonly id!: string;
  public readonly name!: string;
  public readonly members!: Array<Member>;

  constructor(params: VoiceChannelParams) {
    Object.assign(this, params);
  }

  get activeMembers(): Member[] {
    return this.members.filter((m) => m.isInVoiceChannel || m.isLink);
  }
}
