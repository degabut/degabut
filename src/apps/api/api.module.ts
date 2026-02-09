import { AuthModule } from "@auth/auth.module";
import { Logger } from "@logger/logger.service";
import { Module } from "@nestjs/common";
import { CqrsModule, UnhandledExceptionBus } from "@nestjs/cqrs";
import { Subject, takeUntil } from "rxjs";

import { MessagingModule } from "../messaging/messaging.module";
import {
  AuthController,
  HealthController,
  MeController,
  PlayersController,
  PlaylistsController,
  QueuesController,
  UsersController,
} from "./controllers";

@Module({
  imports: [CqrsModule, AuthModule, MessagingModule],
  controllers: [
    AuthController,
    PlaylistsController,
    MeController,
    UsersController,
    PlayersController,
    QueuesController,
    HealthController,
  ],
})
export class ApiModule {
  private destroy$ = new Subject<void>();

  constructor(
    private unhandledExceptionsBus: UnhandledExceptionBus,
    private logger: Logger,
  ) {
    this.unhandledExceptionsBus.pipe(takeUntil(this.destroy$)).subscribe((exceptionInfo) => {
      this.logger.error({
        message: "Unhandled exception",
        ...exceptionInfo,
      });
    });
  }

  onModuleDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
