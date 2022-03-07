import { Snowflake } from "discord.js";
import { Client } from "youtubei";
import { Queue } from "./modules";

// TODO better way to handle global states
const youtube = new Client();
const queues: Map<Snowflake, Queue> = new Map();

export { youtube, queues };
