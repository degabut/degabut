import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetQueuePlayerHandler } from "./get-queue-player";

export * from "./get-queue-player";

export const Queries: Constructor<IQueryHandler>[] = [GetQueuePlayerHandler];
