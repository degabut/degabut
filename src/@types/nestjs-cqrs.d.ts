import { Command, Query } from "@common/cqrs";
import { ICommandHandler, IQueryHandler } from "@nestjs/cqrs";

export * from "@nestjs/cqrs";

declare module "@nestjs/cqrs/dist/query-bus" {
  interface QueryBus {
    execute<X>(query: Query<X>): Promise<X>;
  }

  type IInferredQueryHandler<QueryType extends Query<unknown>> = QueryType extends Query<
    infer ResultType
  >
    ? IQueryHandler<QueryType, ResultType>
    : never;
}

declare module "@nestjs/cqrs/dist/command-bus" {
  interface CommandBus {
    execute<X>(command: Command<X>): Promise<X>;
  }

  type IInferredCommandHandler<CommandType extends Command<unknown>> = CommandType extends Command<
    infer ResultType
  >
    ? ICommandHandler<CommandType, ResultType>
    : never;
}
