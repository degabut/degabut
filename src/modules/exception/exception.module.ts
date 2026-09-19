import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { UnhandledExceptionHandler } from "./unhandled-exception.handler";

@Module({
  imports: [CqrsModule],
  providers: [UnhandledExceptionHandler],
})
export class ExceptionModule {}
