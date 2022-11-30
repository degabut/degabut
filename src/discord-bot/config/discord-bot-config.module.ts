import { Module } from "@nestjs/common";
import { ConfigModule, registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const discordBotConfig = registerAs("discord-bot", () => ({
  token: process.env.TOKEN as string,
  prefix: process.env.PREFIX as string,
  lavalinkHost: process.env.LAVA_HOST as string,
  lavalinkPassword: process.env.LAVA_PASSWORD as string,
  lavalinkPort: +(process.env.LAVA_PORT as string),
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [discordBotConfig],
      validationSchema: Joi.object({
        TOKEN: Joi.string().required(),
        PREFIX: Joi.string().required(),
        LAVA_HOST: Joi.string().required(),
        LAVA_PASSWORD: Joi.string().required(),
        LAVA_PORT: Joi.string(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class DiscordBotConfigModule {}
