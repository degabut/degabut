import { IQuery } from "@nestjs/cqrs";

export class Query<T> implements IQuery {
  private _resultType?: T;
}

export class PaginatedQuery<T> extends Query<T> {
  page?: number;
  limit?: number;
}
