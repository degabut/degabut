import { IQuery } from "@nestjs/cqrs";

export class Query<T> implements IQuery {
  _resultType?: T;
}
