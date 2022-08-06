import { ICommand } from "@nestjs/cqrs";

export class Command<T = void> implements ICommand {
  _resultType?: T;
}
