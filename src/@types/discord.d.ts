import { DecoratedPrefixCommand } from "@main/explorers";

declare module "discord.js" {
  interface Client {
    prefix: string;
    prefixCommands: DecoratedPrefixCommand[];
  }
}
