import { Message } from "discord.js";

type CommandArgs = {
	name: string;
	description?: string;
};

export type CommandExecuteProps = {
	message: Message;
	args: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ICommand {
	name: string;
	description: string;
	aliases?: string[];
	args?: CommandArgs[];
	enabled?: boolean;
	execute: (props: CommandExecuteProps) => Promise<unknown>;
}
