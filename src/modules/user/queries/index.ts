import { Constructor, IQueryHandler } from "@nestjs/cqrs";

import { GetLastPlayedHandler } from "./get-last-played";
import { GetLikedHandler } from "./get-liked";
import { GetMonthlyPlayActivityHandler } from "./get-monthly-play-activity/get-monthly-play-activity.handler";
import { GetMostPlayedHandler } from "./get-most-played";
import { GetRecapHandler } from "./get-recap";
import { IsLikedHandler } from "./is-liked";

export * from "./get-last-played";
export * from "./get-liked";
export * from "./get-monthly-play-activity";
export * from "./get-most-played";
export * from "./get-recap";
export * from "./is-liked";

export const Queries: Constructor<IQueryHandler>[] = [
  GetLastPlayedHandler,
  GetMostPlayedHandler,
  IsLikedHandler,
  GetLikedHandler,
  GetRecapHandler,
  GetMonthlyPlayActivityHandler,
];
