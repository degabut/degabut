import { AuthModule } from "@auth/auth.module";
import { IGlobalConfig } from "@common/config";
import { LoggerModule } from "@logger/logger.module";
import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { YoutubeApiConfigService } from "./config";
import { YoutubeController, YoutubeMusicController } from "./controllers";
import { YoutubeiMusicProvider, YoutubeiProvider } from "./providers";

@Module({
  providers: [YoutubeiProvider, YoutubeiMusicProvider, YoutubeApiConfigService],
  controllers: [YoutubeController, YoutubeMusicController],
})
export class YoutubeApiModule {
  static forRoot(config: IGlobalConfig): DynamicModule {
    if (!config.auth?.jwt) throw new Error("JWT auth is required for Youtube API");

    return {
      module: YoutubeApiModule,
      imports: [
        ConfigModule.forRoot({ load: [() => config.youtube || {}] }),
        LoggerModule.forRoot({ appId: "youtubeApi", ...config.logging }),
        AuthModule.forRoot({ jwt: config.auth?.jwt }),
      ],
    };
  }
}
