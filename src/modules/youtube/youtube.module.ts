import { IYoutubeClientConfig } from "@common/config";
import { DatabaseModule } from "@database/database.module";
import { HttpModule, HttpService } from "@nestjs/axios";
import { DynamicModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import {
  DegabutYoutubeiMusicProvider,
  DegabutYoutubeiProvider,
  IYoutubeiMusicProvider,
  YoutubeEmbedProvider,
  YoutubeiMusicProvider,
  YoutubeiProvider,
} from "./providers";
import { IYoutubeiProvider } from "./providers/youtubei/youtubei.interface";
import { YoutubeChannelRepository, YoutubeVideoRepository } from "./repositories";
import { YoutubeCachedService } from "./services";
import { YOUTUBEI_MUSIC_PROVIDER, YOUTUBEI_PROVIDER } from "./youtube.constants";

@Module({
  imports: [CqrsModule, DatabaseModule, HttpModule.register({ validateStatus: () => true })],
  providers: [
    YoutubeEmbedProvider,
    YoutubeVideoRepository,
    YoutubeChannelRepository,
    YoutubeCachedService,
  ],
  exports: [YoutubeCachedService, YoutubeVideoRepository, YoutubeChannelRepository],
})
export class YoutubeModule {
  static forRoot(config?: IYoutubeClientConfig): DynamicModule {
    return {
      global: true,
      module: YoutubeModule,
      providers: [
        {
          provide: YOUTUBEI_PROVIDER,
          inject: [HttpService],
          useFactory: (http: HttpService): IYoutubeiProvider => {
            if (!config) return new YoutubeiProvider();
            else return new DegabutYoutubeiProvider(http, config.baseUrl, config.authToken);
          },
        },
        {
          provide: YOUTUBEI_MUSIC_PROVIDER,
          inject: [HttpService],
          useFactory: (http: HttpService): IYoutubeiMusicProvider => {
            if (!config) return new YoutubeiMusicProvider();
            else return new DegabutYoutubeiMusicProvider(http, config.baseUrl, config.authToken);
          },
        },
      ],
      exports: [YOUTUBEI_PROVIDER, YOUTUBEI_MUSIC_PROVIDER],
    };
  }
}
