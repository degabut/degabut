import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetQueueHandler } from "./get-queue";

export * from "./get-queue";

export const Queries: Constructor<IQueryHandler>[] = [GetQueueHandler];
