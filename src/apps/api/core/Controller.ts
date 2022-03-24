export enum ResponseStatus {
	OK = 200,
	CREATED = 201,
	NO_CONTENT = 204,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	INTERNAL_SERVER_ERROR = 500,
}

export interface IResponse<T = unknown> {
	status: ResponseStatus;
	body?: T;
}

export interface IRequest<Body, Params> {
	body: Body;
	params: Params;
}

export abstract class Controller<Body = unknown, Params = unknown> {
	private responseStatus = ResponseStatus.OK;
	private responseBody?: unknown;

	protected status(status: ResponseStatus): this {
		this.responseStatus = status;
		return this;
	}

	protected send(body: unknown): this {
		this.responseBody = body;
		return this;
	}

	async execute(request: IRequest<Body, Params>): Promise<IResponse> {
		await this.run(request);
		return { status: this.responseStatus, body: this.responseBody };
	}

	abstract run(request: IRequest<Body, Params>): Promise<Partial<IResponse> | void>;
}
