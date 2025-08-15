import { MediaSource } from "@media-source/entities";

export interface UserMostPlayedQueryModel {
  mediaSourceId: string;
  count: number;
  mediaSource?: MediaSource;
}
