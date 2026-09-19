import { Logger } from "@logger/logger.service";
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from "@nestjs/common";
import { UnhandledExceptionBus } from "@nestjs/cqrs";
import { Subject, takeUntil } from "rxjs";

@Injectable()
export class UnhandledExceptionHandler implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly unhandledExceptionBus: UnhandledExceptionBus,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(UnhandledExceptionHandler.name);
  }

  public onApplicationBootstrap(): void {
    this.unhandledExceptionBus.pipe(takeUntil(this.destroy$)).subscribe(({ cause, exception }) => {
      this.logger.error({
        error: "Unhandled exception",
        cause: UnhandledExceptionHandler.describeCause(cause),
        ...UnhandledExceptionHandler.describeException(exception),
      });
    });
  }

  public onModuleDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private static describeCause(cause: unknown): string {
    const name = (cause as { constructor?: { name?: string } })?.constructor?.name;
    return name || typeof cause;
  }

  private static describeException(exception: unknown): {
    name: string;
    message: string;
    stack?: string;
  } {
    if (exception instanceof Error) {
      return { name: exception.name, message: exception.message, stack: exception.stack };
    }

    return { name: typeof exception, message: String(exception) };
  }
}
