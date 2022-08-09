import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { JoinHandler } from "./join/join.handler";
import { StopHandler } from "./stop";

export * from "./join";
export * from "./stop";

export const Commands: Constructor<ICommandHandler>[] = [JoinHandler, StopHandler];
