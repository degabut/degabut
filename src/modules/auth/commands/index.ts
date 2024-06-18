import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { GetTokenHandler } from "./get-token";

export * from "./get-token";

export const Commands: Constructor<ICommandHandler>[] = [GetTokenHandler];
