import { Injectable } from "@nestjs/common";

import { Logger } from "./logger.service";

@Injectable()
export class GlobalLogger extends Logger {}
