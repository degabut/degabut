import { AuthModule } from "@auth/auth.module";
import { IBotConfig } from "@common/config";
import { DynamicModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { QueueModule } from "@queue/queue.module";

import { MessagingController } from "./controllers";
import { Listeners } from "./listeners";
import { FcmProvider } from "./providers";
import { MessagingRepository } from "./repositories";

@Module({
  imports: [AuthModule, QueueModule, CqrsModule],
  controllers: [MessagingController],
  providers: [FcmProvider, MessagingRepository, ...Listeners],
})
export class MessagingModule {
  static forRoot(config: IBotConfig["messaging"]): DynamicModule {
    if (!config?.googleApplicationCredentials)
      throw new Error("Google Application Credentials are required for Messaging Module");

    return {
      module: MessagingModule,
    };
  }
}
