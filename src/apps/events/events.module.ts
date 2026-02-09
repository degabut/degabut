import { AuthModule } from "@auth/auth.module";
import { Logger } from "@logger/logger.service";
import { Module } from "@nestjs/common";
import { CqrsModule, UnhandledExceptionBus } from "@nestjs/cqrs";
import { Subject, takeUntil } from "rxjs";

import { EventsGateway } from "./events.gateway";
import { Listeners } from "./listeners";

@Module({
  imports: [AuthModule, CqrsModule],
  providers: [EventsGateway, ...Listeners],
})
export class EventsModule {
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
