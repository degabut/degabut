import { Inject, Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { Connection, KNEX_CONNECTION } from "@willsoto/nestjs-objection";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(@Inject(KNEX_CONNECTION) private readonly connection: Connection) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.connection.raw("SELECT 1");
      return this.getStatus("database", true);
    } catch (error) {
      throw new HealthCheckError("Database health check failed", error);
    }
  }
}
