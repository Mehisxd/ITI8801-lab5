import Fastify from "fastify";
import { checkDatabase, database } from "./database.js";
const app = Fastify({
    logger: true,
});
app.get("/health", async (_request, reply) => {
    try {
        await checkDatabase();
        return {
            status: "ok",
            database: "connected",
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(503).send({
            status: "error",
            database: "unavailable",
        });
    }
});
/*
 * Replace this example route with the endpoints required
 * by the provided API document.
 */
app.get("/api/items", async () => {
    const result = await database.query("SELECT id, name, created_at FROM items ORDER BY id");
    return result.rows;
});
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
await app.listen({ host, port });
