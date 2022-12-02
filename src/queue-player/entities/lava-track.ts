import { Track } from "@queue/entities";

export class LavaTrack {
  id: string;
  track: Track;

  constructor(id: string, track: Track) {
    this.id = id;
    this.track = track;
  }
}
