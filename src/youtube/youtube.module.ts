import { DatabaseModule } from "@database/database.module";
import { HttpModule, HttpService } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { YoutubeConfigModule } from "./config";
import { DegabutYoutubeiProvider, YoutubeEmbedProvider, YoutubeiProvider } from "./providers";
import { IYoutubeiProvider } from "./providers/youtubei/youtubei.interface";
import { YoutubeChannelRepository, YoutubeVideoRepository } from "./repositories";
import { YoutubeCachedService } from "./services";
import { YOUTUBEI_PROVIDER } from "./youtube.constants";

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
