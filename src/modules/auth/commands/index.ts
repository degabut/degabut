import { Constructor, ICommandHandler } from "@nestjs/cqrs";

import { GetTokenHandler } from "./get-token";
import { RefreshDiscordTokenHandler } from "./refresh-discord-token";

export * from "./get-token";
export * from "./refresh-discord-token";

export const Commands: Constructor<ICommandHandler>[] = [
  GetTokenHandler,
  RefreshDiscordTokenHandler,
];
