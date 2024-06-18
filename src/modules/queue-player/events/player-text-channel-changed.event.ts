import { QueuePlayer } from "@queue-player/entities";

export class PlayerTextChannelChangedEvent {
  public readonly player!: QueuePlayer;

  constructor(params: PlayerTextChannelChangedEvent) {
    Object.assign(this, params);
  }
}
