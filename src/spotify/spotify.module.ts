import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { SpotifyConfigModule } from "./config";
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
  imports: [ConfigModule, SpotifyConfigModule, DatabaseModule],
  providers: [
    {
      provide: SPOTIFY_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): ISpotifyProvider => {
        const clientId = config.get("spotify.clientId");
        const clientSecret = config.get("spotify.clientSecret");

        if (!clientId || !clientSecret) {
          return new SpotifyNotImplementedProvider();
        }

        return new SpotifyProvider(clientId, clientSecret);
      },
    },
    SpotifyAlbumRepository,
    SpotifyArtistRepository,
    SpotifyTrackRepository,
    SpotifyTrackArtistRepository,
    SpotifyCachedService,
  ],
  exports: [SPOTIFY_PROVIDER, SpotifyCachedService],
})
export class SpotifyModule {}
