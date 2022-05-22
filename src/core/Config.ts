import { injectable } from "tsyringe";

export interface ConfigProps {
	prefix: string;
	token: string;
	env: "development" | "production";
	apiServer?: boolean;
	discordOAuthClientId?: string;
	discordOAuthClientSecret?: string;
	discordOAuthRedirectUri?: string;
	postgresDatabaseUrl?: string;
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
	readonly postgresDatabaseUrl?: string;

	constructor(props: ConfigProps) {
		this.prefix = props.prefix;
		this.token = props.token;
		this.env = props.env || "development";
		this.apiServer = !!props.apiServer;
		this.discordOAuthClientId = props.discordOAuthClientId;
		this.discordOAuthClientSecret = props.discordOAuthClientSecret;
		this.discordOAuthRedirectUri = props.discordOAuthRedirectUri;
		this.postgresDatabaseUrl = props.postgresDatabaseUrl;

		if (!this.prefix) throw new Error("Missing config: PREFIX");
		if (!this.token) throw new Error("Missing config: TOKEN");

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
