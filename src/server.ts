import Fastify from "fastify";
import { database } from "./database.js";
import { exerciseRoutes } from "./routes/exercises.js";
import { healthRoutes } from "./routes/health.js";

const app = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      coerceTypes: false,
    },
  },
});

function isValidationError(
  error: unknown,
): error is { validation: unknown } {
  return (
    typeof error === "object" &&
    error !== null &&
    "validation" in error
  );
}

function toError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error(String(error));
}

app.setErrorHandler((error, request, reply) => {
  const isBadRequest =
    isValidationError(error) ||
    (hasStatusCode(error) && error.statusCode === 400);

  if (isBadRequest) {
    return reply.code(400).send({
      error: "Invalid request body",
    });
  }

  request.log.error(
    toError(error),
    "Unhandled request error",
  );

  return reply.code(500).send({
    error: "Internal server error",
  });
});

await app.register(healthRoutes);
await app.register(exerciseRoutes);

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

let isShuttingDown = false;

async function shutDown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  app.log.info({ signal }, "Shutting down");

  try {
    await app.close();
    await database.end();
    process.exit(0);
  } catch (error) {
    app.log.error(
      toError(error),
      "Failed to shut down cleanly",
    );

    process.exit(1);
  }
}

process.on("SIGTERM", () => {
  void shutDown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutDown("SIGINT");
});

try {
  await app.listen({
    host,
    port,
  });
} catch (error) {
  app.log.error(
    toError(error),
    "Failed to start the service",
  );

  await database.end();
  process.exit(1);
}

function hasStatusCode(
  error: unknown,
): error is { statusCode: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  );
}