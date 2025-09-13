import { NestedPartial } from "@common/interfaces";
import { readFile } from "fs/promises";
import * as Joi from "joi";
import { parse } from "yaml";

import { IBotConfig, IConfig } from "./interfaces";

export class ConfigUtil {
  private static schema = Joi.object<IConfig>({
    apps: Joi.object({
      bot: Joi.object({
        token: Joi.string().required(),
        prefix: Joi.string().required(),
        http: Joi.object({
          port: Joi.number().required(),
          path: Joi.string().optional(),
        }).optional(),
        ws: Joi.object({
          port: Joi.number().optional(),
          path: Joi.string().optional(),
        })
          .optional()
          .or("port", "path"),
      }).optional(),
      youtubeApi: Joi.object({
        port: Joi.number().optional(),
        path: Joi.string().optional(),
      })
        .optional()
        .or("port", "path"),
    }).required(),
    logging: Joi.object({
      level: Joi.string()
        .valid("info", "warn", "error", "debug", "verbose")
        .optional()
        .default("info"),
      printConfig: Joi.boolean().optional().default(false),
      pretty: Joi.boolean().optional().default(false),
      file: Joi.object({
        path: Joi.string().required(),
        minLength: Joi.number().optional(),
        sync: Joi.boolean().optional().default(false),
        append: Joi.boolean().optional().default(true),
      }).optional(),
    }).optional(),
    postgres: Joi.object({
      host: Joi.string().required(),
      port: Joi.number().optional().default(5432),
      user: Joi.string().required(),
      password: Joi.string().required(),
      database: Joi.string().required(),
    }).required(),
    lavalink: Joi.object({
      host: Joi.string().required(),
      port: Joi.number().optional().default(2333),
      password: Joi.string().required(),
    }).required(),
    spotify: Joi.object({
      clientId: Joi.string().required(),
      clientSecret: Joi.string().required(),
    }).optional(),
    auth: Joi.object({
      discordOAuth: Joi.object({
        clientId: Joi.string().required(),
        clientSecret: Joi.string().required(),
      }),
      jwt: Joi.object({
        secret: Joi.string().required(),
        expirationTime: Joi.string().optional(),
      }).required(),
    }).required(),
    youtubeApi: Joi.object({
      baseUrl: Joi.string().required(),
      authToken: Joi.string().required(),
    }).optional(),
    youtube: Joi.object({
      oauth: Joi.object({
        refreshToken: Joi.string().required(),
      }).optional(),
      proxy: Joi.object({
        protocol: Joi.string().valid("http", "https").required(),
        host: Joi.string().required(),
        port: Joi.number().required(),
        username: Joi.string().required(),
        password: Joi.string().required(),
      }).optional(),
    }).optional(),
  });

  static async getConfig() {
    const config = this.mergeConfig(await this.getYmlConfig(), this.getEnvConfig());

    // validate oauth manually because I don't know how to do it with Joi lol
    let requiredOauth = false;
    if (config.apps?.bot?.http || config.apps?.bot?.ws) {
      requiredOauth = true;
    }

    if (requiredOauth && !config.auth?.discordOAuth) {
      throw new Joi.ValidationError("auth.discordOAuth is required", [], undefined);
    }

    return await this.schema.validateAsync(config, { abortEarly: false, stripUnknown: true });
  }

  private static async getYmlConfig() {
    // read config from yml file
    const path = process.env.CONFIG_PATH || "./config.yml";
    let config: NestedPartial<IConfig> = {};
    let file: string;

    try {
      file = await readFile(path, "utf8");
    } catch {
      return {};
    }

    config = parse(file);
    return config || {};
  }

  private static getEnvConfig() {
    const config: NestedPartial<IConfig> = {};

    // logging
    config.logging = {};
    if (process.env.LOG_LEVEL) {
      config.logging.level = process.env.LOG_LEVEL;
    }

    config.logging.printConfig = process.env.LOG_PRINT_CONFIG === "true";
    config.logging.pretty = process.env.LOG_PRETTY === "true";

    if (process.env.LOG_FILE_PATH) {
      config.logging.file = {
        path: process.env.LOG_FILE_PATH,
      };

      if (process.env.LOG_FILE_MIN_LENGTH) {
        config.logging.file.minLength = +process.env.LOG_FILE_MIN_LENGTH;
      }
      if (process.env.LOG_FILE_SYNC) {
        config.logging.file.sync = process.env.LOG_FILE_SYNC === "true";
      }
      if (process.env.LOG_FILE_APPEND) {
        config.logging.file.append = process.env.LOG_FILE_APPEND === "true";
      }
    }

    config.apps = {};

    // bot
    const prefix = process.env.PREFIX;
    const token = process.env.TOKEN;
    if (prefix && token) {
      const botConfig: IBotConfig = {
        token,
        prefix,
      };

      process.env.HTTP_PORT = process.env.API_PORT || process.env.HTTP_PORT;
      if (process.env.HTTP_PORT) {
        botConfig.http = {
          port: +process.env.HTTP_PORT,
          path: process.env.API_PATH || process.env.HTTP_PATH,
        };
      }
      if (process.env.WS_PORT || process.env.WS_PATH) {
        let wsPort = process.env.WS_PORT;
        if (process.env.WS_PATH && !wsPort && process.env.HTTP_PORT) wsPort = process.env.HTTP_PORT;
        botConfig.ws = wsPort
          ? {
              port: +wsPort,
              path: process.env.WS_PATH,
            }
          : undefined;
      }

      config.apps.bot = botConfig;
    }

    // youtube api
    const youtubeApiPort = process.env.YOUTUBE_API_PORT;
    if (youtubeApiPort) {
      config.apps.youtubeApi = {
        port: +youtubeApiPort,
        path: process.env.YOUTUBE_API_PATH,
      };
    }

    // lavalink
    const lavalinkHost = process.env.LAVA_HOST;
    const lavalinkPort = process.env.LAVA_PORT;
    const lavalinkPassword = process.env.LAVA_PASSWORD;

    if (lavalinkHost && lavalinkPassword) {
      config.lavalink = {
        ...config.lavalink,
        host: lavalinkHost,
        port: lavalinkPort ? +lavalinkPort : undefined,
        password: lavalinkPassword,
      };
    }

    // postgres
    const postgresHost = process.env.POSTGRES_HOST;
    const postgresPort = process.env.POSTGRES_PORT;
    const postgresUser = process.env.POSTGRES_USER;
    const postgresPassword = process.env.POSTGRES_PASSWORD;
    const postgresDb = process.env.POSTGRES_DB;

    if (postgresHost && postgresUser && postgresPassword && postgresDb) {
      const [host, port] = postgresHost.split(":");
      config.postgres = {
        ...config.postgres,
        host: host,
        port: +(postgresPort || port) || undefined,
        user: postgresUser,
        password: postgresPassword,
        database: postgresDb,
      };
    }

    // spotify
    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (spotifyClientId && spotifyClientSecret) {
      config.spotify = {
        ...config.spotify,
        clientId: spotifyClientId,
        clientSecret: spotifyClientSecret,
      };
    }

    // auth
    config.auth = {};

    const discordOAuthClientId = process.env.DISCORD_OAUTH_CLIENT_ID;
    const discordOAuthClientSecret = process.env.DISCORD_OAUTH_CLIENT_SECRET;
    if (discordOAuthClientId && discordOAuthClientSecret) {
      config.auth.discordOAuth = {
        ...config.auth.discordOAuth,
        clientId: discordOAuthClientId,
        clientSecret: discordOAuthClientSecret,
      };
    }

    const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
    const jwtExpirationTime = process.env.JWT_EXPIRATION_TIME;
    if (jwtPrivateKey) {
      config.auth.jwt = {
        ...config.auth.jwt,
        secret: jwtPrivateKey,
        expirationTime: jwtExpirationTime,
      };
    }

    // youtube client
    const baseUrl = process.env.DEGABUT_YOUTUBE_BASE_URL;
    const authToken = process.env.DEGABUT_YOUTUBE_AUTH_TOKEN;
    if (baseUrl && authToken) {
      config.youtubeApi = {
        ...config.youtubeApi,
        baseUrl,
        authToken,
      };
    }

    // youtube
    config.youtube = {};

    const youtubeRefreshToken = process.env.YOUTUBE_OAUTH_REFRESH_TOKEN;
    if (youtubeRefreshToken) {
      config.youtube.oauth = {
        ...config.youtube.oauth,
        refreshToken: youtubeRefreshToken,
      };
    }

    const proxyProtocol = process.env.YOUTUBE_PROXY_PROTOCOL;
    const proxyHost = process.env.YOUTUBE_PROXY_HOST;
    const proxyPort = process.env.YOUTUBE_PROXY_PORT;
    const proxyUser = process.env.YOUTUBE_PROXY_USERNAME;
    const proxyPassword = process.env.YOUTUBE_PROXY_PASSWORD;
    if (proxyHost && proxyPort && proxyUser && proxyPassword) {
      config.youtube.proxy = {
        ...config.youtube.proxy,
        protocol: (proxyProtocol as "http" | "https") || "http",
        host: proxyHost,
        port: +proxyPort,
        username: proxyUser,
        password: proxyPassword,
      };
    }

    return config;
  }

  private static mergeConfig(a: any, b: any): NestedPartial<IConfig> {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return Array.from(keys).reduce((result: any, key: string) => {
      if (typeof a[key] === "object" && a[key] !== null && b[key]) {
        result[key] = ConfigUtil.mergeConfig(a[key], b[key]);
      } else {
        result[key] = b[key] !== undefined ? b[key] : a[key];
      }
      return result;
    }, {});
  }
}
