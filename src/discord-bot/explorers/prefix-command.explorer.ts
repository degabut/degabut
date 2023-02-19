import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DiscoveryService } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { Client, DiscordAPIError } from "discord.js";

import { PrefixCommandOptions, PREFIX_COMMAND } from "../decorators";
import { IPrefixCommand } from "../interfaces";

export type DecoratedPrefixCommand<T> = {
  instanceWrapper: InstanceWrapper<T>;
  options: PrefixCommandOptions;
};

@Injectable()
export class PrefixCommandExplorer {
  private readonly logger = new Logger(PrefixCommandExplorer.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly configService: ConfigService,

    @InjectDiscordClient()
    private readonly discordClient: Client,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();
    const prefixCommands = this.getPrefixCommands(providers);

    this.registerPrefixCommands(prefixCommands);
  }

  private getPrefixCommands(
    providers: InstanceWrapper[],
  ): DecoratedPrefixCommand<IPrefixCommand>[] {
    const prefixCommands = providers.reduce((val, i) => {
      if (!i.instance || typeof i.instance !== "object") return val;
      const options = Reflect.getMetadata(PREFIX_COMMAND, i.instance);
      if (!options) return val;

      val.push({ instanceWrapper: i, options });
      return val;
    }, [] as DecoratedPrefixCommand<IPrefixCommand>[]);

    return prefixCommands;
  }

  private registerPrefixCommands(commands: DecoratedPrefixCommand<IPrefixCommand>[]) {
    const prefix = this.configService.getOrThrow("discord-bot.prefix");
    this.discordClient.prefixCommands = commands;

    this.discordClient.on("messageCreate", async (message) => {
      if (message.author.bot || !message.content.startsWith(prefix) || !message.guild) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = (args.shift() as string).toLowerCase();
      const command = commands.find(
        (c) => c.options.name === commandName || c.options.aliases?.includes(commandName),
      );

      if (!command) return;

      try {
        const reply = await command.instanceWrapper.instance.handler(message, args);
        if (reply) message.reply(reply);
      } catch (error) {
        if (error instanceof DiscordAPIError && (error.code === 10003 || error.code === 50013)) {
          await message.author.send(`Failed to execute the command: ${(error as Error).message}`);
        } else {
          await message.reply(`⚠ Failed to execute the command: **${(error as Error).message}**`);
        }
      }
    });

    for (const command of commands) {
      let commandName = command.options.name;
      if (command.options.aliases) commandName += ` (${command.options.aliases.join(", ")})`;
      this.logger.log(`Registered {${commandName}} prefix command handler`);
    }
  }
}
