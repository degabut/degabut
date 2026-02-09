import { AuthModule } from "@auth/auth.module";
import { Logger } from "@logger/logger.service";
import { Module } from "@nestjs/common";
import { CqrsModule, UnhandledExceptionBus } from "@nestjs/cqrs";
import { QueueModule } from "@queue/queue.module";
import { Subject, takeUntil } from "rxjs";

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
