import { Inject, Injectable } from "@nestjs/common";
import { QueueRepository } from "@queue/repositories";
import { Client } from "discord.js";
import { Once } from "necord";

import { IAudioPlayerManager } from "./providers";
import { AUDIO_PLAYER_MANAGER_PROVIDER } from "./queue-player.constants";
import { QueuePlayerRepository } from "./repositories";

@Injectable()
export class QueuePlayerGateway {
  constructor(
    @Inject(AUDIO_PLAYER_MANAGER_PROVIDER)
    private readonly playerManager: IAudioPlayerManager,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly queueRepository: QueueRepository,
    private readonly client: Client,
  ) {}

  @Once("ready")
  onReady() {
    this.playerManager.init(this.client);

    this.playerManager.on("disconnected", () => {
      this.queueRepository.clear();
      this.playerRepository.clear();
    });
  }
}
