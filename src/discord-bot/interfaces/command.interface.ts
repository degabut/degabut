import { Message, MessagePayload, MessageReplyOptions } from "discord.js";

export type CommandResult = string | MessagePayload | MessageReplyOptions | void;

export interface IPrefixCommand {
  prefixHandler(message: Message, args: string[]): Promise<CommandResult | Promise<CommandResult>>;
}
