export type IConfig = {
  apps: {
    bot?: IBotConfig;
    youtubeApi?: IYoutubeApiConfig;
  };
} & IGlobalConfig;

export interface IGlobalConfig {
  lavalink: ILavalinkConfig;
  postgres: IPostgresConfig;
  logging?: ILoggerConfig;
  spotify?: ISpotifyConfig;
  auth?: IAuthConfig;
  youtubeApi?: IYoutubeClientConfig;
  youtube?: IYoutubeConfig;
}

export interface IBotConfig {
  token: string;
  prefix: string;
  http?: { port: number };
  ws?: { port: number };
}

export interface IYoutubeApiConfig {
  port: number;
}

export interface ILavalinkConfig {
  host: string;
  password: string;
  port?: number;
}

export interface IYoutubeDlConfig {
  path: string;
}

export interface IPostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface ILoggerConfig {
  level?: string;
  pretty?: boolean;
  printConfig?: boolean;
}

export interface ISpotifyConfig {
  clientId: string;
  clientSecret: string;
}

export interface IYoutubeClientConfig {
  baseUrl: string;
  authToken: string;
}

export interface IAuthConfig {
  discordOAuth?: IDiscordOAuthConfig;
  jwt?: IJwtConfig;
}

export interface IDiscordOAuthConfig {
  clientId: string;
  clientSecret: string;
}

export interface IJwtConfig {
  secret: string;
  expirationTime?: string;
}

export interface IYoutubeConfig {
  oauth: {
    refreshToken: string;
  };
}
