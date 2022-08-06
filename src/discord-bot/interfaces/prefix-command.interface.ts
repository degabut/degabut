import { Message, MessagePayload, ReplyMessageOptions } from "discord.js";

export type PrefixCommandResult = string | MessagePayload | ReplyMessageOptions | void;

export interface IPrefixCommand {
  handler(
    message: Message,
    args: string[],
  ): Promise<PrefixCommandResult | Promise<PrefixCommandResult>>;
}
