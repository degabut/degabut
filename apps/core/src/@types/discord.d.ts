import { DecoratedPrefixCommand } from "../apps/discord-bot/explorers";

declare module "discord.js" {
  interface Client {
    prefix: string;
    prefixCommands: DecoratedPrefixCommand[];
  }
}
