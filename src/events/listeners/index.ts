import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { QueueHandler } from "./queue.handler";

export * from "./queue.handler";

export const Listeners: Constructor<IEventHandler>[] = [QueueHandler];
