import { Image } from "@common/entities";
import { v4 } from "uuid";

interface ConstructorProps {
  id?: string;
  name: string;
  ownerId: string;
  mediaSourceCount: number;
  images?: Image[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Playlist {
  public readonly id: string;
  public name: string;
  public readonly ownerId: string;
  public mediaSourceCount: number;
  public images: Image[];
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ConstructorProps) {
    this.id = props.id || v4();
    this.name = props.name;
    this.ownerId = props.ownerId;
    this.mediaSourceCount = props.mediaSourceCount;
    this.images = props.images || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
