import { GetUserAdapter, GetUserUseCase } from "@modules/discord/useCases/GetUserUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../core/Controller";

@injectable()
export class VerifyTokenMiddleware extends Controller {
	constructor(@inject(GetUserUseCase) private getUser: GetUserUseCase) {
		super();
	}

	async run({ headers }: IRequest): Promise<unknown> {
		const authorization = Array.isArray(headers["authorization"])
			? headers["authorization"][0]
			: headers["authorization"];

		if (!authorization) return this.status(ResponseStatus.UNAUTHORIZED).send();

		const [, accessToken] = authorization.split(" ");
		if (!accessToken) return this.status(ResponseStatus.UNAUTHORIZED).send();

		const adapter = new GetUserAdapter({ accessToken });
		const user = await this.getUser.execute(adapter);
		if (!user) return this.status(ResponseStatus.UNAUTHORIZED).send();

		this.user = user;
	}
}
