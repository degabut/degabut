import { injectable } from "tsyringe";

export interface ConfigProps {
	prefix: string;
	token: string;
	env: "development" | "production";
	apiServer?: boolean;
	discordOAuthClientId?: string;
	discordOAuthClientSecret?: string;
	discordOAuthRedirectUri?: string;
	postgresDatabase: string;
	postgresUser: string;
	postgresPassword: string;
	postgresHost: string;
}

@injectable()
export class Config {
	readonly prefix!: string;
	readonly token!: string;
	readonly env!: "development" | "production";
	readonly apiServer?: boolean;
	readonly discordOAuthClientId?: string;
	readonly discordOAuthClientSecret?: string;
	readonly discordOAuthRedirectUri?: string;
	readonly postgresDatabase: string;
	readonly postgresUser: string;
	readonly postgresPassword: string;
	readonly postgresHost: string;

	constructor(props: ConfigProps) {
		this.prefix = props.prefix;
		this.token = props.token;
		this.env = props.env || "development";
		this.apiServer = !!props.apiServer;
		this.discordOAuthClientId = props.discordOAuthClientId;
		this.discordOAuthClientSecret = props.discordOAuthClientSecret;
		this.discordOAuthRedirectUri = props.discordOAuthRedirectUri;
		this.postgresDatabase = props.postgresDatabase;
		this.postgresUser = props.postgresUser;
		this.postgresPassword = props.postgresPassword;
		this.postgresHost = props.postgresHost;

		const required = [
			"prefix",
			"token",
			"postgresDatabase",
			"postgresUser",
			"postgresPassword",
			"postgresHost",
		] as const;

		const missing = required.filter((key) => !(key in props) || !props[key]);
		if (missing.length) throw new Error(`Missing config properties: ${missing.join(", ")}`);

		if (
			this.apiServer &&
			(!this.discordOAuthClientId ||
				!this.discordOAuthClientSecret ||
				!this.discordOAuthRedirectUri)
		) {
			throw new Error("Missing config for API server");
		}
	}
}
