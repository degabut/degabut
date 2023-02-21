import { Message, MessagePayload, ReplyMessageOptions } from "discord.js";

export type CommandResult = string | MessagePayload | ReplyMessageOptions | void;

export interface IPrefixCommand {
  prefixHandler(message: Message, args: string[]): Promise<CommandResult | Promise<CommandResult>>;
}
