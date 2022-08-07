import { ICommand } from "@nestjs/cqrs";

export class Command<T = void> implements ICommand {
  private _resultType?: T;
}
