import { Module } from "@nestjs/common";
import { ConfigModule, registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const youtubeConfig = registerAs("youtube", () => ({
  degabutYoutubeBaseUrl: process.env.DEGABUT_YOUTUBE_BASE_URL as string,
  degabutYoutubeAuthToken: process.env.DEGABUT_YOUTUBE_AUTH_TOKEN as string,
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [youtubeConfig],
      validationSchema: Joi.object({
        DEGABUT_YOUTUBE_BASE_URL: Joi.string().uri(),
        DEGABUT_YOUTUBE_AUTH_TOKEN: Joi.string(),
      }).and("DEGABUT_YOUTUBE_BASE_URL", "DEGABUT_YOUTUBE_AUTH_TOKEN"),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class YoutubeConfigModule {}
