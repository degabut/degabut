import { Logger } from "@logger/logger.service";
import { Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { Client, DiscordAPIError } from "discord.js";

import { PrefixCommandOptions, TEXT_COMMAND } from "../decorators";

export type DecoratedPrefixCommand = {
  instanceWrapper: InstanceWrapper;
  options: PrefixCommandOptions;
  methodName: string;
};

@Injectable()
export class TextCommandExplorer {
  constructor(
    private readonly prefix: string,
    private readonly discoveryService: DiscoveryService,
    private readonly discordClient: Client,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(TextCommandExplorer.name);
  }

  onModuleInit() {
    const providers = this.discoveryService.getProviders();
    const prefixCommands = this.getTextCommands(providers);

    this.registerPrefixCommands(prefixCommands);
  }

  private getTextCommands(providers: InstanceWrapper[]): DecoratedPrefixCommand[] {
    const prefixCommands = providers.reduce((val, i) => {
      if (!i.instance || typeof i.instance !== "object") return val;

      const prototype = Object.getPrototypeOf(i.instance);
      const methodNames = Object.getOwnPropertyNames(prototype);

      for (const methodName of methodNames) {
        const options = Reflect.getMetadata(TEXT_COMMAND, prototype, methodName);
        if (!options) continue;
        val.push({ instanceWrapper: i, options, methodName });
      }
      return val;
    }, [] as DecoratedPrefixCommand[]);

    return prefixCommands;
  }

  private registerPrefixCommands(commands: DecoratedPrefixCommand[]) {
    this.discordClient.prefixCommands = commands.sort((a, b) =>
      a.options.name.localeCompare(b.options.name),
    );

    this.discordClient.on("messageCreate", async (message) => {
      if (message.author.bot || !message.content.startsWith(this.prefix) || !message.guild) return;

      const args = message.content.slice(this.prefix.length).trim().split(/ +/);
      const commandName = (args.shift() as string).toLowerCase();
      const command = commands.find(
        (c) => c.options.name === commandName || c.options.aliases?.includes(commandName),
      );

      if (!command) return;

      const { instanceWrapper, methodName } = command;

      try {
        const reply = await instanceWrapper.instance[methodName](message, args);
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
      this.logger.info(`Registered {${commandName}} prefix command handler`);
    }
  }
}
