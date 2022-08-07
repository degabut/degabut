import { IQuery } from "@nestjs/cqrs";

export class Query<T> implements IQuery {
  private _resultType?: T;
}
