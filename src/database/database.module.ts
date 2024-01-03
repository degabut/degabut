import { UserListenHistoryModel, UserPlayHistoryModel } from "@history/repositories";
import { MediaSourceModel } from "@media-source/repositories";
import { Inject, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PlaylistMediaSourceModel, PlaylistModel } from "@playlist/repositories";
import {
  SpotifyAlbumModel,
  SpotifyArtistModel,
  SpotifyTrackArtistModel,
  SpotifyTrackModel,
} from "@spotify/repositories";
import { UserLikeMediaSourceModel } from "@user/repositories";
import { Connection, KNEX_CONNECTION, ObjectionModule } from "@willsoto/nestjs-objection";
import { YoutubeChannelModel, YoutubeVideoModel } from "@youtube/repositories";
import * as path from "path";

import { DatabaseConfigModule } from "./config";

@Module({
  imports: [
    DatabaseConfigModule,
    ObjectionModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const [host, port] = config.get("database.host").split(":");
        return {
          config: {
            client: "pg",
            connection: {
              ...config.getOrThrow<any>("database"),
              host,
              port: +(port || 5432),
            },
            migrations: {
              directory: path.join(__dirname, "./migrations"),
              tableName: "knex_migrations",
              loadExtensions: [".js"],
            },
          },
        };
      },
    }),
    ObjectionModule.forFeature([
      UserPlayHistoryModel,
      UserListenHistoryModel,
      UserLikeMediaSourceModel,
      MediaSourceModel,
      YoutubeVideoModel,
      YoutubeChannelModel,
      SpotifyAlbumModel,
      SpotifyArtistModel,
      SpotifyTrackModel,
      SpotifyTrackArtistModel,
      PlaylistModel,
      PlaylistMediaSourceModel,
    ]),
  ],
  exports: [ObjectionModule],
})
export class DatabaseModule {
  constructor(@Inject(KNEX_CONNECTION) private readonly connection: Connection) {}

  async onModuleInit(): Promise<void> {
    await this.connection.migrate.latest();
  }
}
