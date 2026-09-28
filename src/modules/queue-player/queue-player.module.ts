import { ILavalinkConfig, INodeLinkConfig } from "@common/config";
import { Logger } from "@logger/logger.service";
import { MediaSourceModule } from "@media-source/media-source.module";
import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { QueueModule } from "@queue/queue.module";
import { YoutubeModule } from "@youtube/youtube.module";
import { NodeType } from "lavalink-client";

import { Commands } from "./commands";
import { QueuePlayerConfigService } from "./config";
import { Listeners } from "./listeners";
import { IAudioPlayerManager, LavalinkPlayerProvider } from "./providers";
import { Queries } from "./queries";
import { AUDIO_PLAYER_MANAGER_PROVIDER } from "./queue-player.contants";
import { QueuePlayerGateway } from "./queue-player.gateway";
import { QueuePlayerRepository } from "./repositories";
import { QueuePlayerService } from "./services";

@Module({
  imports: [CqrsModule, YoutubeModule, QueueModule, MediaSourceModule],
  providers: [
    QueuePlayerService,
    QueuePlayerRepository,
    QueuePlayerGateway,
    QueuePlayerConfigService,
    ConfigService,
    ...Commands,
    ...Queries,
    ...Listeners,
  ],
  exports: [QueuePlayerService],
})
export class QueuePlayerModule {
  static forRoot(config: {
    lavalink?: ILavalinkConfig;
    nodelink?: INodeLinkConfig;
  }): DynamicModule {
    return {
      global: true,
      module: QueuePlayerModule,
      providers: [
        {
          provide: AUDIO_PLAYER_MANAGER_PROVIDER,
          inject: [Logger],
          useFactory: (logger: Logger): IAudioPlayerManager => {
            return new LavalinkPlayerProvider(
              (config.lavalink || config.nodelink)!,
              config.lavalink ? NodeType.Lavalink : NodeType.NodeLink,
              logger,
            );
          },
        },
      ],
    };
  }
}
