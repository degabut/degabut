import { injectable } from "tsyringe";

export interface ConfigProps {
	prefix: string;
	token: string;
	apiServer?: boolean;
	jwtSecret?: string;
	discordOAuthClientId?: string;
	discordOAuthClientSecret?: string;
	discordOAuthRedirectUri?: string;
}

@injectable()
export class Config {
	readonly prefix!: string;
	readonly token!: string;
	readonly apiServer?: boolean;
	readonly jwtSecret?: string;
	readonly discordOAuthClientId?: string;
	readonly discordOAuthClientSecret?: string;
	readonly discordOAuthRedirectUri?: string;

	constructor(props: ConfigProps) {
		this.prefix = props.prefix;
		this.token = props.token;
		this.apiServer = !!props.apiServer;
		this.jwtSecret = props.jwtSecret;
		this.discordOAuthClientId = props.discordOAuthClientId;
		this.discordOAuthClientSecret = props.discordOAuthClientSecret;
		this.discordOAuthRedirectUri = props.discordOAuthRedirectUri;

		if (!this.prefix) throw new Error("Missing config: PREFIX");
		if (!this.token) throw new Error("Missing config: TOKEN");

		if (
			this.apiServer &&
			(!this.jwtSecret ||
				!this.discordOAuthClientId ||
				!this.discordOAuthClientSecret ||
				!this.discordOAuthRedirectUri)
		) {
			throw new Error("Missing config for API server");
		}
	}
}
