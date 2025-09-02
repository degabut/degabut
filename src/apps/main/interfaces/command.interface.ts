import { Message, MessagePayload, MessageReplyOptions } from "discord.js";

export type CommandResult = string | MessagePayload | MessageReplyOptions | undefined | void;

export interface ITextCommand {
  prefixHandler(message: Message, args: string[]): Promise<CommandResult | Promise<CommandResult>>;
}
