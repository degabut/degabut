import { IQuery } from "@nestjs/cqrs";

export class Query<T> implements IQuery {
  private _resultType?: T;
}

export class PaginatedQuery<T> extends Query<T> {
  nextToken?: string;
  limit!: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  nextToken: string | null;
}
