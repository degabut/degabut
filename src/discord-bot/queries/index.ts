import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetPositionHandler } from "./get-position";

export * from "./get-position";

export const Queries: Constructor<IQueryHandler>[] = [GetPositionHandler];
