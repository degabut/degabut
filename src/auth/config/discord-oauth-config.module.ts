import { Module } from "@nestjs/common";
import { ConfigModule, registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const discordOAuthConfig = registerAs("discord-oauth", () => ({
  clientId: process.env.DISCORD_OAUTH_CLIENT_ID as string,
  clientSecret: process.env.DISCORD_OAUTH_CLIENT_SECRET as string,
  botToken: process.env.TOKEN as string,
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [discordOAuthConfig],
      validationSchema: Joi.object({
        TOKEN: Joi.string().required(),
        DISCORD_OAUTH_CLIENT_ID: Joi.string().required(),
        DISCORD_OAUTH_CLIENT_SECRET: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class DiscordOAuthConfigModule {}
