import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { RemovePlayHistoryHandler } from "./remove-play-history";

export * from "./remove-play-history";

export const Commands: Constructor<ICommandHandler>[] = [RemovePlayHistoryHandler];
