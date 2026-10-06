import pg from "pg";
const { Pool } = pg;
export const database = new Pool({
    connectionString: process.env.DATABASE_URL,
});
export async function checkDatabase() {
    await database.query("SELECT 1");
}
