import { Node } from "lavaclient";

declare module "discord.js" {
  interface Client {
    lavalink: Node;
  }
}
