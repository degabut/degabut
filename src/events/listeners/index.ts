import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { MemberJammedHandler } from "./member-jammed.handler";
import { QueueHandler } from "./queue.handler";

export * from "./member-jammed.handler";
export * from "./queue.handler";

export const Listeners: Constructor<IEventHandler>[] = [QueueHandler, MemberJammedHandler];
