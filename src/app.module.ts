import { ApiModule } from "@api/api.module";
import { AuthModule } from "@auth/auth.module";
import { DatabaseModule } from "@database/database.module";
import { DiscordBotModule } from "@discord-bot/discord-bot.module";
import { EventsModule } from "@events/events.module";
import { HealthModule } from "@health/health.module";
import { HistoryModule } from "@history/history.module";
import { LoggerModule } from "@logger/logger.module";
import { MediaSourceModule } from "@media-source/media-source.module";
import { Logger, Module } from "@nestjs/common";
import { PlaylistModule } from "@playlist/playlist.module";
import { QueuePlayerModule } from "@queue-player/queue-player.module";
import { QueueModule } from "@queue/queue.module";
import { SpotifyModule } from "@spotify/spotify.module";
import { UserModule } from "@user/user.module";

@Module({
  imports: [
    ApiModule,
    AuthModule,
    DatabaseModule,
    DiscordBotModule,
    EventsModule,
    HistoryModule,
    HealthModule,
    LoggerModule,
    PlaylistModule,
    MediaSourceModule,
    SpotifyModule,
    QueueModule,
    QueuePlayerModule,
    UserModule,
  ],
})
export class AppModule {
  private logger = new Logger(AppModule.name);

  onModuleInit() {
    // TODO dirty workaround to catch error on CQRS event
    // https://github.com/nestjs/cqrs/issues/409
    process.on("unhandledRejection", (reason, promise) => {
      this.logger.error({ error: "unhandledRejection", reason, promise });
    });
    process.on("uncaughtException", (reason, origin) => {
      const r: Record<string, any> = {};
      for (const propertyName of Object.getOwnPropertyNames(reason)) {
        r[propertyName] = reason[propertyName as keyof typeof reason];
      }

      this.logger.error({ error: "uncaughtException", ...r, origin });
    });
  }
}
