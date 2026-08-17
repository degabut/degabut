import { IYoutubeClientConfig, IYoutubeConfig } from "@common/config";
import { DatabaseModule } from "@database/database.module";
import { HttpModule, HttpService } from "@nestjs/axios";
import { DynamicModule, forwardRef, InjectionToken, Module } from "@nestjs/common";
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
  static forRoot(config?: IYoutubeClientConfig | IYoutubeConfig): DynamicModule {
    const cacheAll = config && "cacheAll" in config ? config.cacheAll ?? true : true;

    return {
      global: true,
      module: YoutubeModule,
      providers: [
        {
          provide: YOUTUBEI_PROVIDER,
          inject: [
            HttpService,
            forwardRef(() => YoutubeCachedService) as unknown as InjectionToken,
          ],
          useFactory: (
            http: HttpService,
            youtubeService: YoutubeCachedService,
          ): IYoutubeiProvider => {
            if (config && "baseUrl" in config) {
              return new DegabutYoutubeiProvider({
                httpService: http,
                baseUrl: config.baseUrl,
                authToken: config.authToken,
                cacheAll,
                youtubeService,
              });
            } else {
              return new YoutubeiProvider({
                oauthRefreshToken: config?.oauth?.refreshToken,
                proxyUrl: this.getProxyUrl(config?.proxy),
                cacheAll,
                youtubeService,
              });
            }
          },
        },
        {
          provide: YOUTUBEI_MUSIC_PROVIDER,
          inject: [
            HttpService,
            forwardRef(() => YoutubeCachedService) as unknown as InjectionToken,
          ],
          useFactory: (
            http: HttpService,
            youtubeService: YoutubeCachedService,
          ): IYoutubeiMusicProvider => {
            if (config && "baseUrl" in config) {
              return new DegabutYoutubeiMusicProvider({
                httpService: http,
                baseUrl: config.baseUrl,
                authToken: config.authToken,
                cacheAll,
                youtubeService,
              });
            } else {
              return new YoutubeiMusicProvider({
                oauthRefreshToken: config?.oauth?.refreshToken,
                proxyUrl: this.getProxyUrl(config?.proxy),
                cacheAll,
                youtubeService,
              });
            }
          },
        },
      ],
      exports: [YOUTUBEI_PROVIDER, YOUTUBEI_MUSIC_PROVIDER],
    };
  }

  static getProxyUrl(config: IYoutubeConfig["proxy"]): string | undefined {
    return config
      ? `${config.protocol}://${config.username}:${config.password}@${config.host}:${config.port}`
      : undefined;
  }
}
