import { APIUser } from "discord-api-types/v9";

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
	status?: ResponseStatus;
	body?: T;
}

export interface IRequest<Body = unknown, Params = unknown, Query = unknown> {
	body: Body;
	params: Params;
	query: Query;
	headers: Record<string, string | string[] | undefined>;
}

export abstract class Controller<Body = unknown, Params = unknown, Query = unknown> {
	private responseStatus?: ResponseStatus;
	private responseBody?: unknown;
	public user!: APIUser;

	protected status(status: ResponseStatus): this {
		this.responseStatus = status;
		return this;
	}

	protected send(body?: unknown): this {
		this.responseBody = body;
		return this;
	}

	async execute(request: IRequest<Body, Params, Query>): Promise<IResponse> {
		await this.run(request);
		return { status: this.responseStatus, body: this.responseBody };
	}

	abstract run(request: IRequest<Body, Params, Query>): Promise<unknown>;
}