import type { FastifyInstance } from "fastify";
import { checkDatabase } from "../database.js";
import type { HealthResponse } from "../types.js";

export async function healthRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get(
    "/health",
    async (_request, reply): Promise<HealthResponse | void> => {
      try {
        await checkDatabase();

        return {
          status: "ok",
        };
      } catch (error) {
        app.log.error(error, "Database health check failed");

        return reply.code(503).send();
      }
    },
  );
}