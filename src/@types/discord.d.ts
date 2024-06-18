import { DecoratedPrefixCommand } from "@discord-bot/explorers";

declare module "discord.js" {
  interface Client {
    prefix: string;
    prefixCommands: DecoratedPrefixCommand[];
  }
}
