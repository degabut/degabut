import { ISpotifyConfig } from "@common/config";
import { DatabaseModule } from "@database/database.module";
import { Logger } from "@logger/logger.service";
import { DynamicModule, Module } from "@nestjs/common";

import { ISpotifyProvider, SpotifyNotImplementedProvider, SpotifyProvider } from "./providers";
import {
  SpotifyAlbumRepository,
  SpotifyArtistRepository,
  SpotifyTrackArtistRepository,
  SpotifyTrackRepository,
} from "./repositories";
import { SpotifyCachedService } from "./services";
import { SPOTIFY_PROVIDER } from "./spotify.constants";

@Module({
  imports: [DatabaseModule],
  providers: [
    SpotifyAlbumRepository,
    SpotifyArtistRepository,
    SpotifyTrackRepository,
    SpotifyTrackArtistRepository,
    SpotifyCachedService,
  ],
  exports: [SpotifyCachedService],
})
export class SpotifyModule {
  static forRoot(config?: ISpotifyConfig): DynamicModule {
    return {
      global: true,
      module: SpotifyModule,
      providers: [
        {
          provide: SPOTIFY_PROVIDER,
          inject: [Logger],
          useFactory: (logger: Logger): ISpotifyProvider => {
            if (!config?.clientId || !config?.clientSecret) {
              return new SpotifyNotImplementedProvider();
            }
            return new SpotifyProvider(config.clientId, config.clientSecret, logger);
          },
        },
      ],
      exports: [SPOTIFY_PROVIDER],
    };
  }
}
