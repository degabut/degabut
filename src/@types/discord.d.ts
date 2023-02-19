import { DecoratedPrefixCommand } from "@discord-bot/explorers";
import { IPrefixCommand } from "@discord-bot/interfaces";
import { Node } from "lavaclient";

declare module "discord.js" {
  interface Client {
    lavalink: Node;
    prefixCommands: DecoratedPrefixCommand<IPrefixCommand>[];
  }
}
