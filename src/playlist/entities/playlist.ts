import { v4 } from "uuid";

interface ConstructorProps {
  id?: string;
  name: string;
  ownerId: string;
  videoCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Playlist {
  public readonly id: string;
  public name: string;
  public ownerId: string;
  public videoCount: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ConstructorProps) {
    this.id = props.id || v4();
    this.name = props.name;
    this.ownerId = props.ownerId;
    this.videoCount = props.videoCount;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
