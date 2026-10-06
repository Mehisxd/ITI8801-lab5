import type { FastifyInstance } from "fastify";
import { database } from "../database.js";
import type {
  ErrorResponse,
  Exercise,
  NewExercise,
} from "../types.js";

interface ExerciseIdParameters {
  id: string;
}

interface ExerciseQuery {
  name?: string;
}

const newExerciseSchema = {
  type: "object",
  required: ["name", "repetitions"],
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 100,
      pattern: "^[^\\u0000]*$",
    },
    repetitions: {
      type: "integer",
      minimum: 0,
      maximum: 1_000_000,
    },
  },
} as const;

function parsePositiveInteger(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id)) {
    return null;
  }

  return id;
}

export async function exerciseRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get<{ Querystring: ExerciseQuery }>(
    "/api/exercises",
    async (request): Promise<Exercise[]> => {
      const { name } = request.query;

      if (name !== undefined) {
        const result = await database.query<Exercise>(
          `
            SELECT id, name, repetitions
            FROM exercises
            WHERE name = $1
            ORDER BY id ASC
          `,
          [name],
        );

        return result.rows;
      }

      const result = await database.query<Exercise>(
        `
          SELECT id, name, repetitions
          FROM exercises
          ORDER BY id ASC
        `,
      );

      return result.rows;
    },
  );

  app.post<{ Body: NewExercise }>(
    "/api/exercises",
    {
      schema: {
        body: newExerciseSchema,
      },
    },
    async (request, reply): Promise<Exercise> => {
      const { name, repetitions } = request.body;

      const result = await database.query<Exercise>(
        `
          INSERT INTO exercises (name, repetitions)
          VALUES ($1, $2)
          RETURNING id, name, repetitions
        `,
        [name, repetitions],
      );

      return reply.code(201).send(result.rows[0]);
    },
  );

  app.get<{ Params: ExerciseIdParameters }>(
    "/api/exercises/:id",
    async (
      request,
      reply,
    ): Promise<Exercise | ErrorResponse> => {
      const id = parsePositiveInteger(request.params.id);

      if (id === null) {
        return reply.code(404).send({
          error: "Exercise not found",
        });
      }

      const result = await database.query<Exercise>(
        `
          SELECT id, name, repetitions
          FROM exercises
          WHERE id = $1
        `,
        [id],
      );

      const exercise = result.rows[0];

      if (!exercise) {
        return reply.code(404).send({
          error: "Exercise not found",
        });
      }

      return exercise;
    },
  );

  app.delete<{ Params: ExerciseIdParameters }>(
    "/api/exercises/:id",
    async (request, reply): Promise<void | ErrorResponse> => {
      const id = parsePositiveInteger(request.params.id);

      if (id === null) {
        return reply.code(404).send({
          error: "Exercise not found",
        });
      }

      const result = await database.query(
        `
          DELETE FROM exercises
          WHERE id = $1
        `,
        [id],
      );

      if (result.rowCount === 0) {
        return reply.code(404).send({
          error: "Exercise not found",
        });
      }

      return reply.code(204).send();
    },
  );
}