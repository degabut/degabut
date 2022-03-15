import { Middleware } from "discord.js";
import { queues } from "../shared";

export const hasQueue: Middleware = async (message) => {
	const queue = message.guild ? queues.get(message.guild.id) : undefined;
	if (!queue) throw new Error("Queue not found");
};
