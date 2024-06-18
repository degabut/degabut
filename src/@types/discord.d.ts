import { DecoratedPrefixCommand } from "@discord-bot/explorers";
import { IPrefixCommand } from "@discord-bot/interfaces";

declare module "discord.js" {
  interface Client {
    prefixCommands: DecoratedPrefixCommand<IPrefixCommand>[];
  }
}
