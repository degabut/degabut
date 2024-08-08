import { Injectable, LoggerService, Scope } from "@nestjs/common";
import { Params, PinoLogger } from "nestjs-pino";

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends PinoLogger implements LoggerService {
  private _logger?: typeof PinoLogger.root;

  constructor(appId: string, params: Params) {
    super(params);
    this._logger = this.logger.child({ app: appId });
  }

  log(message: any, ...optionalParams: any[]) {
    super.info(message, ...optionalParams);
  }

  get logger(): typeof PinoLogger.root {
    return this._logger || super.logger;
  }
}
