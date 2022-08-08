import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetTokenHandler } from "./get-token";

export * from "./get-token";

export const Queries: Constructor<IQueryHandler>[] = [GetTokenHandler];
