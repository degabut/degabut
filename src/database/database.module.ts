import { UserListenHistoryModel, UserPlayHistoryModel } from "@history/repositories";
import { Inject, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PlaylistModel, PlaylistVideoModel } from "@playlist/repositories";
import { UserLikeVideoModel } from "@user/repositories";
import { Connection, KNEX_CONNECTION, ObjectionModule } from "@willsoto/nestjs-objection";
import { ChannelModel, VideoModel } from "@youtube/repositories";
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
      UserLikeVideoModel,
      VideoModel,
      ChannelModel,
      PlaylistModel,
      PlaylistVideoModel,
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
