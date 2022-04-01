import {
	GetAccessTokenAdapter,
	GetAccessTokenUseCase,
} from "@modules/discord/useCases/GetAccessTokenUseCase";
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
		const adapter = new GetAccessTokenAdapter({ code: body.code });
		const accessToken = await this.getAccessToken.execute(adapter);

		this.status(ResponseStatus.OK).send({ accessToken });
	}
}
