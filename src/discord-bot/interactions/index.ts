import { IButtonInteraction } from "@discord-bot/interfaces";
import { Constructor } from "@nestjs/cqrs";

import { PlayButtonInteraction } from "./play.button-interaction";

export * from "./play.button-interaction";

export const Interactions: Constructor<IButtonInteraction>[] = [PlayButtonInteraction];
