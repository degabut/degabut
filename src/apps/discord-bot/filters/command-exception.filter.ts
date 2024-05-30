import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { BaseInteraction } from "discord.js";
import { NecordArgumentsHost } from "necord";

@Catch()
export class CommandExceptionFilter implements ExceptionFilter {
  public async catch(exception: Error, host: ArgumentsHost) {
    const result = NecordArgumentsHost.create(host).getContext();
    const interaction = result?.[0];

    if (interaction && interaction instanceof BaseInteraction && interaction.isRepliable()) {
      return await interaction.reply({
        content: `⚠ ${exception.message}`,
        ephemeral: true,
      });
    }

    return exception;
  }
}
