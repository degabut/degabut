import { IButtonInteraction } from "@discord-bot/interfaces";
import { Constructor } from "@nestjs/cqrs";

import { PlayButtonInteraction } from "./play.button-interaction";
import { RemoveButtonInteraction } from "./remove.button-interaction";

export * from "./play.button-interaction";
export * from "./remove.button-interaction";

export const Interactions: Constructor<IButtonInteraction>[] = [
  PlayButtonInteraction,
  RemoveButtonInteraction,
];
