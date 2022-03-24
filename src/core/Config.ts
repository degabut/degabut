import { injectable } from "tsyringe";

export interface ConfigProps {
	prefix: string;
	token: string;
	apiServer?: boolean;
}

@injectable()
export class Config {
	readonly prefix!: string;
	readonly token!: string;
	readonly apiServer?: boolean;

	constructor(props: ConfigProps) {
		this.prefix = props.prefix;
		this.token = props.token;
		this.apiServer = !!props.apiServer;

		if (!this.prefix) throw new Error("Missing config: PREFIX");
		if (!this.token) throw new Error("Missing config: TOKEN");
	}
}
