import { IPostgresConfig } from "@common/config";
import {
  UserListenHistoryModel,
  UserMonthlyPlayActivityModel,
  UserPlayHistoryModel,
} from "@history/repositories";
import { MediaSourceModel } from "@media-source/repositories";
import { DynamicModule, Inject, Module } from "@nestjs/common";
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

@Module({
  imports: [
    ObjectionModule.forFeature([
      UserPlayHistoryModel,
      UserListenHistoryModel,
      UserLikeMediaSourceModel,
      UserMonthlyPlayActivityModel,
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

  static forRoot(config: IPostgresConfig): DynamicModule {
    return {
      global: true,
      module: DatabaseModule,
      imports: [
        ObjectionModule.registerAsync({
          useFactory: () => {
            const [host, port] = config.host.split(":");
            return {
              config: {
                client: "pg",
                connection: { ...config, host, port: +(port || 5432) },
                migrations: {
                  directory: path.join(__dirname, "./migrations"),
                  tableName: "knex_migrations",
                  loadExtensions: [".js"],
                },
              },
            };
          },
        }),
      ],
    };
  }
}
