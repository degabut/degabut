import { GetAccessTokenUseCase } from "@modules/discord/useCases/GetAccessTokenUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Body = {
	code: string;
};

@injectable()
export class LoginController extends Controller<Body> {
	constructor(@inject(GetAccessTokenUseCase) private getAccessToken: GetAccessTokenUseCase) {
		super();
	}

	async run({ body }: IRequest<Body>): Promise<void> {
		const accessToken = await this.getAccessToken.execute({
			code: body.code,
		});

		this.status(ResponseStatus.OK).send({ accessToken });
	}
}
