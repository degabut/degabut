import { DatabaseModule } from "@database/database.module";
import { HttpModule, HttpService } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { YoutubeConfigModule } from "./config";
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
  imports: [
    ConfigModule,
    YoutubeConfigModule,
    DatabaseModule,
    HttpModule.register({ validateStatus: () => true }),
  ],
  providers: [
    {
      provide: YOUTUBEI_PROVIDER,
      inject: [ConfigService, HttpService],
      useFactory: (config: ConfigService, http: HttpService): IYoutubeiProvider => {
        const baseUrl = config.get("youtube.degabutYoutubeBaseUrl");
        const authToken = config.get("youtube.degabutYoutubeAuthToken");

        if (baseUrl && authToken) return new DegabutYoutubeiProvider(http, baseUrl, authToken);
        else return new YoutubeiProvider();
      },
    },
    {
      provide: YOUTUBEI_MUSIC_PROVIDER,
      inject: [ConfigService, HttpService],
      useFactory: (config: ConfigService, http: HttpService): IYoutubeiMusicProvider => {
        const baseUrl = config.get("youtube.degabutYoutubeBaseUrl");
        const authToken = config.get("youtube.degabutYoutubeAuthToken");

        if (baseUrl && authToken) return new DegabutYoutubeiMusicProvider(http, baseUrl, authToken);
        else return new YoutubeiMusicProvider();
      },
    },
    YoutubeEmbedProvider,
    YoutubeVideoRepository,
    YoutubeChannelRepository,
    YoutubeCachedService,
  ],
  exports: [
    YOUTUBEI_PROVIDER,
    YoutubeCachedService,
    YoutubeVideoRepository,
    YoutubeChannelRepository,
  ],
})
export class YoutubeModule {}
