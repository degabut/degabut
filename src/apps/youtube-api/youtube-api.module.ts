import { AuthModule } from "@auth/auth.module";
import { IConfig } from "@common/config";
import { LoggerModule } from "@logger/logger.module";
import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RouterModule } from "@nestjs/core";

import { YoutubeApiConfigService } from "./config";
import { HealthController, YoutubeController, YoutubeMusicController } from "./controllers";
import { YoutubeiMusicProvider, YoutubeiProvider } from "./providers";

@Module({
  providers: [YoutubeiProvider, YoutubeiMusicProvider, YoutubeApiConfigService],
  controllers: [HealthController, YoutubeController, YoutubeMusicController],
})
export class YoutubeApiModule {
  static forRoot(config: IConfig): DynamicModule {
    if (!config.auth?.jwt) throw new Error("JWT auth is required for Youtube API");
    if (!config.apps.youtubeApi) throw new Error("Youtube API configuration is missing");

    const imports = [
      ConfigModule.forRoot({ load: [() => config.youtube || {}] }),
      LoggerModule.forRoot({ appId: "youtubeApi", ...config.logging }),
      AuthModule.forRoot({ jwt: config.auth?.jwt }),
    ];

    if (config.apps.youtubeApi.path) {
      imports.push(
        RouterModule.register([{ path: config.apps.youtubeApi.path, module: YoutubeApiModule }]),
      );
    }

    return {
      module: YoutubeApiModule,
      imports,
    };
  }
}
