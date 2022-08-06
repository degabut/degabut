import { Inject, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Connection, KNEX_CONNECTION, ObjectionModule } from "@willsoto/nestjs-objection";
import { ChannelModel, VideoModel } from "@youtube/repositories";
import { UserPlayHistoryModel } from "@youtube/repositories/user-play-history";
import * as path from "path";

import { DatabaseConfigModule } from "./config";

@Module({
  imports: [
    DatabaseConfigModule,
    ObjectionModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        config: {
          client: "pg",
          connection: {
            ...config.getOrThrow<any>("database"),
            port: 5432,
          },
          migrations: {
            directory: path.join(__dirname, "./migrations"),
            tableName: "knex_migrations",
            loadExtensions: [".js"],
          },
        },
      }),
    }),
    ObjectionModule.forFeature([UserPlayHistoryModel, VideoModel, ChannelModel]),
  ],
  exports: [ObjectionModule],
})
export class DatabaseModule {
  constructor(@Inject(KNEX_CONNECTION) private readonly connection: Connection) {}

  async onModuleInit(): Promise<void> {
    await this.connection.migrate.latest();
  }
}
