import { Module } from "@nestjs/common";
import { ConfigModule, registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const spotifyConfig = registerAs("spotify", () => ({
  clientId: process.env.SPOTIFY_CLIENT_ID as string,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [spotifyConfig],
      validationSchema: Joi.object({
        SPOTIFY_CLIENT_ID: Joi.string(),
        SPOTIFY_CLIENT_SECRET: Joi.string(),
      }).and("SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class SpotifyConfigModule {}
