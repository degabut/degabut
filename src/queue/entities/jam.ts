import { Member } from "./member";

export class JamCollection {
  public readonly requestedBy!: Member;
  public readonly jams!: Jam[];

  constructor(params: JamCollection) {
    Object.assign(this, params);
  }
}

export class Jam {
  public readonly xOffset!: number;
  public readonly jamSpeed!: number;
  public readonly ySpeed!: number;

  constructor(params: Jam) {
    Object.assign(this, params);
  }
}
