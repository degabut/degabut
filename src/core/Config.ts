import { injectable } from "tsyringe";

export interface ConfigProps {
	prefix: string;
	token: string;
	webSocketServer?: boolean;
	jwtSecret?: string;
}

@injectable()
export class Config {
	readonly prefix!: string;
	readonly token!: string;
	readonly webSocketServer?: boolean;
	readonly jwtSecret?: string;

	constructor(props: ConfigProps) {
		this.prefix = props.prefix;
		this.token = props.token;
		this.webSocketServer = !!props.webSocketServer;
		this.jwtSecret = props.jwtSecret;

		if (!this.prefix) throw new Error("Missing config: PREFIX");
		if (!this.token) throw new Error("Missing config: TOKEN");
	}
}
