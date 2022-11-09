import { Constructor, IEventHandler } from "@nestjs/cqrs";

export const Listeners: Constructor<IEventHandler>[] = [];
